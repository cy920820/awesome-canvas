element = document.getElementById("animate");

if (element) {
  // reset the transition by...
  element.addEventListener("click", function(e) {
    e.preventDefault;

    console.log('element', element.classList);

    // removing the class
    element.classList.remove("run-animation");

    // triggering reflow
    void element.offsetWidth;

    // and re-adding the class
    element.classList.add("run-animation");
  }, false);
}

