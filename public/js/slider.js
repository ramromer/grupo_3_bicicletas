let indexItem = 1;
unSlider(indexItem);
function siguiente(n) {
    unSlider(indexItem += n);
}
function unSlider(n) {
let i;
let x = document.getElementsByClassName("sliderImagen");
if (n > x.length) {indexItem = 1}
if (n < 1) {indexItem = x.length}
for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";  
}
x[indexItem-1].style.display = "block";  
}