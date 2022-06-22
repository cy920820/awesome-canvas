// Made with TroisJS : https://github.com/troisjs/trois
import { createApp } from 'https://unpkg.com/vue@3.0.11/dist/vue.esm-browser.prod.js'
import {
  lerp,
  BufferGeometry,
  Camera,
  EffectComposer,
  Points,
  Renderer,
  RenderPass,
  Scene,
  ShaderMaterial,
  Texture,
  UnrealBloomPass,
  ZoomBlurPass,
} from 'https://unpkg.com/troisjs@0.3.0-beta.4/build/trois.module.cdn.min.js'
import { Clock, Color, MathUtils, Vector3 } from 'https://unpkg.com/three@0.127.0/build/three.module.js'

const { randFloat: rnd, randInt, randFloatSpread: rndFS } = MathUtils

const vertexShader = `
  uniform float uTime;
  attribute vec3 color;
  attribute float size;
  attribute float velocity;
  varying vec4 vColor;
  void main(){
    vColor = vec4(color, 1.0);
    vec3 p = vec3(position);
    p.z = -150. + mod(position.z + uTime, 300.);
    vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );
    gl_PointSize = size * (-50.0 / mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  varying vec4 vColor;
  void main() {
    gl_FragColor = vColor * texture2D(uTexture, gl_PointCoord);
  }
`

createApp({
  template: `
    <Renderer ref="renderer" pointer resize="window">
      <Camera :position="{ z: 0 }" :fov="50" />
      <Scene>
        <Points ref="points" :position="{ z: -150 }">
          <BufferGeometry :attributes="attributes" />
          <ShaderMaterial :blending="2" :depth-test="false" :uniforms="uniforms" :vertex-shader="vertexShader" :fragment-shader="fragmentShader">
            <Texture src="https://assets.codepen.io/33787/sprite.png" uniform="uTexture" />
          </ShaderMaterial>
        </Points>
      </Scene>
      <EffectComposer>
        <RenderPass />
        <UnrealBloomPass :strength="2" :radius="0" :threshold="0" />
        <ZoomBlurPass :strength="zoomStrength" />
      </EffectComposer>
    </Renderer>
    <a href="#" @click="updateColors" @mouseenter="targetTimeCoef = 100" @mouseleave="targetTimeCoef = 1">Random Colors</a>
  `,
  components: { BufferGeometry, Camera, EffectComposer, Points, Renderer, RenderPass, Scene, ShaderMaterial, Texture, UnrealBloomPass, ZoomBlurPass },
  setup() {
    const POINTS_COUNT = 50000

    const palette = niceColors[83]

    const positions = new Float32Array(POINTS_COUNT * 3)
    const colors = new Float32Array(POINTS_COUNT * 3)
    const sizes = new Float32Array(POINTS_COUNT)
    const v3 = new Vector3(),
      color = new Color()
    for (let i = 0; i < POINTS_COUNT; i++) {
      v3.set(rndFS(200), rndFS(200), rndFS(300))
      v3.toArray(positions, i * 3)
      color.set(palette[Math.floor(rnd(0, palette.length))])
      color.toArray(colors, i * 3)
      sizes[i] = rnd(5, 20)
    }

    const attributes = [
      { name: 'position', array: positions, itemSize: 3 },
      { name: 'color', array: colors, itemSize: 3 },
      { name: 'size', array: sizes, itemSize: 1 },
    ]

    const uniforms = { uTime: { value: 0 } }

    const clock = new Clock()

    const timeCoef = 1,
      targetTimeCoef = 1

    return {
      POINTS_COUNT,
      attributes,
      uniforms,
      vertexShader,
      fragmentShader,
      clock,
      timeCoef,
      targetTimeCoef,
    }
  },
  data() {
    return {
      zoomStrength: 0,
    }
  },
  mounted() {
    const renderer = this.$refs.renderer
    const positionN = renderer.three.pointer.positionN
    const points = this.$refs.points.points

    renderer.onBeforeRender(() => {
      this.timeCoef = lerp(this.timeCoef, this.targetTimeCoef, 0.02)
      this.uniforms.uTime.value += this.clock.getDelta() * this.timeCoef * 4
      this.zoomStrength = this.timeCoef * 0.004

      const da = 0.05
      const tiltX = lerp(points.rotation.x, positionN.y * da, 0.02)
      const tiltY = lerp(points.rotation.y, -positionN.x * da, 0.02)
      points.rotation.set(tiltX, tiltY, 0)
    })
  },
  methods: {
    updateColors() {
      const colorAttribute = this.$refs.points.geometry.attributes.color
      const ip = randInt(0, 99)
      const palette = niceColors[ip]
      console.log(ip)
      const color = new Color()
      for (let i = 0; i < this.POINTS_COUNT; i++) {
        color.set(palette[randInt(0, palette.length)])
        color.toArray(colorAttribute.array, i * 3)
      }
      colorAttribute.needsUpdate = true
    },
  },
}).mount('#app')
