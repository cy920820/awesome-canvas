/*
 * Noel Delgado - @pixelia_me
 * Inspiration: https://dingundding.tumblr.com/post/99836716906
 */

/* https://threejs.org/examples/js/Detector.js */
var Detector={canvas:!!window.CanvasRenderingContext2D,webgl:function(){try{var e=document.createElement("canvas");return!!window.WebGLRenderingContext&&(e.getContext("webgl")||e.getContext("experimental-webgl"))}catch(t){return false}}(),workers:!!window.Worker,fileapi:window.File&&window.FileReader&&window.FileList&&window.Blob,getWebGLErrorMessage:function(){var e=document.createElement("div");e.id="webgl-error-message";e.style.fontFamily="monospace";e.style.fontSize="13px";e.style.fontWeight="normal";e.style.textAlign="center";e.style.background="#fff";e.style.color="#000";e.style.padding="1.5em";e.style.width="400px";e.style.margin="5em auto 0";if(!this.webgl){e.innerHTML=window.WebGLRenderingContext?['Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />','Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join("\n"):['Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>','Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join("\n")}return e},addGetWebGLMessage:function(e){var t,n,r;e=e||{};t=e.parent!==undefined?e.parent:document.body;n=e.id!==undefined?e.id:"oldie";r=Detector.getWebGLErrorMessage();r.id=n;t.appendChild(r)}};

if (!Detector.webgl) Detector.addGetWebGLMessage();

/* -- */
var debug, _width, _height, PI, Utils, CUBE_SIZE, GRID, TOTAL_CUBES, WALL_SIZE, HALF_WALL_SIZE,
    MAIN_COLOR, SECONDARY_COLOR, cubes, renderer, camera, scene, group

debug = false
_width = window.innerWidth
_height = window.innerHeight
PI = Math.PI

CUBE_SIZE = 100 /* width, height */
GRID = 6 /* cols, rows */
TOTAL_CUBES = (GRID * GRID)
WALL_SIZE = (GRID * CUBE_SIZE)
HALF_WALL_SIZE = (WALL_SIZE / 2)
MAIN_COLOR = 0xFFFFFF
SECONDARY_COLOR = 0x222222
cubes = []

renderer = new THREE.WebGLRenderer({antialias: false})
camera = new THREE.PerspectiveCamera(45, (_width / _height), 0.1, 10000)
scene = new THREE.Scene()
group = new THREE.Object3D()

Utils = {
    randomInRange : function(min, max) {
        return Math.floor(Math.random() * (max- min + 1)) + min;
    }
}

/* -- -- */
setupCamera(0, 0, 800)
setupBox(group)
setupFloor(group)
setupCubes(group)
setupLights(group)
group.position.y = 50
group.rotation.set(-60 * (PI/180), 0, -45 * (PI/180))
scene.add(group)
setupRenderer(document.body)

/* -- -- */
if (debug) render()
else TweenLite.ticker.addEventListener("tick", render)
window.addEventListener('resize', resizeHandler, false)

/* -- -- */
function resizeHandler() {
    _width = window.innerWidth
    _height = window.innerHeight
    renderer.setSize(_width, _height)
    camera.aspect = _width / _height
    camera.updateProjectionMatrix()
}

/* -- CAMERA -- */
function setupCamera(x, y, z) {
    camera.position.set(x, y, z)
    scene.add(camera)
}

/* -- BOX -- */
function setupBox(parent) {
    var i, boxesArray, geometry, material

    boxesArray = []
    geometry = new THREE.BoxGeometry(WALL_SIZE, WALL_SIZE, 0.05)
    geometry.faces[8].color.setHex(SECONDARY_COLOR)
    geometry.faces[9].color.setHex(SECONDARY_COLOR)
    geometry.colorsNeedUpdate = true
    material = new THREE.MeshBasicMaterial({
        color : MAIN_COLOR,
        vertexColors : THREE.FaceColors
    })

    for (i = 0; i < 5; i++) {
        boxesArray.push(new THREE.Mesh(geometry, material))
    }

    // back
    boxesArray[0].position.set(0, HALF_WALL_SIZE, -HALF_WALL_SIZE)
    boxesArray[0].rotation.x = 90 * (PI/180)

    // right
    boxesArray[1].position.set(HALF_WALL_SIZE, 0, -HALF_WALL_SIZE)
    boxesArray[1].rotation.y = -90 * (PI/180)

    // front
    boxesArray[2].position.set(0, -HALF_WALL_SIZE, -HALF_WALL_SIZE)
    boxesArray[2].rotation.x = -90 * (PI/180)

    // left
    boxesArray[3].position.set(-HALF_WALL_SIZE, 0, -HALF_WALL_SIZE)
    boxesArray[3].rotation.y = 90 * (PI/180)

    // bottom
    boxesArray[4].position.set(0, 0, -WALL_SIZE)

    boxesArray.forEach(function(box) {
        parent.add(box)
    });
}

/* -- FLOOR -- */
function setupFloor(parent) {
    var i, tilesArray, geometry, material

    tilesArray = []
    geometry = new THREE.PlaneBufferGeometry(WALL_SIZE, WALL_SIZE)
    material = new THREE.MeshLambertMaterial({
        color : MAIN_COLOR
    })

    for (i = 0; i < 8; i++) {
        tilesArray.push(new THREE.Mesh(geometry, material))
    }

    tilesArray[0].position.set(-WALL_SIZE, WALL_SIZE, 0)
    tilesArray[1].position.set(0, WALL_SIZE, 0)
    tilesArray[2].position.set(WALL_SIZE, WALL_SIZE, 0)
    tilesArray[3].position.set(-WALL_SIZE, 0, 0)
    tilesArray[4].position.set(WALL_SIZE, 0, 0)
    tilesArray[5].position.set(-WALL_SIZE, -WALL_SIZE, 0)
    tilesArray[6].position.set(0, -WALL_SIZE, 0)
    tilesArray[7].position.set(WALL_SIZE, -WALL_SIZE, 0)

    tilesArray.forEach(function(tile) {
        tile.receiveShadow = true
        parent.add(tile)
    })
}

/* -- CUBES --*/
function setupCubes(parent) {
    var i, geometry, material, x, y, row, col, minDuration, maxDuration, minDelay, maxDelay, attrOptions, attr, direction, config

    geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, 0.05)
    material = new THREE.MeshLambertMaterial({color: MAIN_COLOR})
    x = 0
    y = 0
    row = 0
    col = 0
    minDuration = 3
    maxDuration = 6
    minDelay = 0.5
    maxDelay = 6
    attrOptions = ['x', 'y']

    for (i = 0; i < TOTAL_CUBES; i++) {
        cubes.push(new THREE.Mesh(geometry, material))

        if ((i % GRID) === 0) {
            col = 1
            row++
        } else col++

        x = -(((GRID * CUBE_SIZE) / 2) - ((CUBE_SIZE) * col) + (CUBE_SIZE/2))
        y = -(((GRID * CUBE_SIZE) / 2) - ((CUBE_SIZE) * row) + (CUBE_SIZE/2))

        cubes[i].position.set(x, y, 0)
    }

    cubes.forEach(function(cube) {
        cube.castShadow = true
        cube.receiveShadow = true
        
        if (debug) {
          cube.rotation.x = (Math.random() * 10)
        } else {
            config = {
                ease : Elastic.easeOut,
                delay : Utils.randomInRange(minDelay, maxDelay),
                repeat : -1
            }
            attr = attrOptions[~~(Math.random() * attrOptions.length)]
            direction = (Math.random() < 0.5 ? -PI : PI)
            config[attr] = direction

            TweenMax.to(
                cube.rotation,
                Utils.randomInRange(minDuration, maxDuration),
                config
            )
        } 
      
        parent.add(cube)
    })
}

/* -- LIGHTS -- */
function setupLights(parent) {
    var light, soft_light

    light = new THREE.DirectionalLight(MAIN_COLOR, 1.25)
    soft_light = new THREE.DirectionalLight(MAIN_COLOR, 1.5)

    light.position.set(-WALL_SIZE, -WALL_SIZE, CUBE_SIZE * GRID)
    light.castShadow = true
    light.shadowDarkness = 0.5
    
    soft_light.position.set(WALL_SIZE, WALL_SIZE, CUBE_SIZE * GRID)

    parent.add(light).add(soft_light)
}

/* -- RENDERER -- */
function setupRenderer(parent) {
    renderer.setSize(_width, _height)
    renderer.setClearColorHex(MAIN_COLOR, 1.0);
    renderer.shadowMapEnabled = true
    parent.appendChild(renderer.domElement)
}

function render() {
    renderer.render(scene, camera)
}
