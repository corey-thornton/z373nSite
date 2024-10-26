const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particlesArray = [];
const numberOfParticles = 2000;

let firstButton = document.getElementById('button1');
let buttonMeasure = firstButton.getBoundingClientRect();
let button = {
    x: buttonMeasure.left,
    y: buttonMeasure.top,
    width: buttonMeasure.width,
    height: 10
}

let header = document.getElementById('typedtext');
let headerMeasure = header.getBoundingClientRect();
let headerVals = {
    x: headerMeasure.left,
    y: headerMeasure.top,
    width: headerMeasure.width,
    height: 10
}
let mouseX;
let mouseY;
let circumference;
class Particle {
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5;
        this.weight = Math.random() * 3;
        let value = Math.random();
        if(value > 0 && value < 0.5){
            value = value * -1
        }
        this.directionX = value; 
    }
    update(){
        if (this.y > canvas.height){
            this.y = 0 - this.size;
            this.weight = Math.random() * 3;
            this.x = Math.random() * canvas.width * 1.2
        } 
        this.weight += 0.01;
        this.y += this.weight;
        this.x += this.directionX;

        // check for collision between each particle and button
        if (
            this.x < button.x + button.width &&
            this.x + this.size > button.x &&
            this.y < button.y + button.height &&
            this.y + this.size > button.y
        ){
            this.y -= 3;
            this.weight *= -0.5
        }

        if (
            this.x < headerVals.x + headerVals.width &&
            this.x + this.size > headerVals.x &&
            this.y < headerVals.y + headerVals.height &&
            this.y + this.size > headerVals.y
        ){
            this.y -= 3;
            this.weight *= -0.5
        }
        //check for collision with mouse
        if(
            this.x  < mouseX  &&
            this.x + this.size > (mouseX - circumference/2 ) &&
            this.y < mouseY + circumference/2 &&
            this.y + this.size > mouseY - circumference/2
        ){
            this.x -=3
        }else if(
            this.x  > mouseX  &&
            this.x + this.size < (mouseX + circumference/2 ) &&
            this.y < mouseY + circumference/2 &&
            this.y + this.size > mouseY - circumference/2
        ){
            this.x +=3
        }

        if(
            this.x  > mouseX  &&
            this.x + this.size < (mouseX + circumference/2 ) &&
            this.y < mouseY + circumference/2 &&
            this.y + this.size > mouseY - circumference/2
        ){
            this.y -=3
            this.weight *= -0.5
        }


    }
    draw(){
        var grd = ctx.createLinearGradient(0, 0, 700, 0);
        grd.addColorStop(0.5, "blue");
        grd.addColorStop(1, "red");
        ctx.beginPath();
        ctx.fillStyle = grd;
        ctx.arc(this.x,this.y,this.size,0,2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }
}
function init(){
    particlesArray = [];
    for (let index = 0; index < numberOfParticles; index++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particlesArray.push(new Particle(x, y))
    }
}
init();
function animate(){
    ctx.fillStyle = 'rgba(77,77,77,.2)';
    ctx.fillRect(0,0,canvas.width,canvas.height) 
        for (let index = 0; index < particlesArray.length; index++) {
            particlesArray[index].update();
            particlesArray[index].draw();
            
        }  

    requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buttonMeasure = firstButton.getBoundingClientRect();
    button = {
        x: buttonMeasure.left,
        y: buttonMeasure.top,
        width: buttonMeasure.width,
        height: 10
    }
    init();
})

window.addEventListener('mousemove', function(e){
   mouseX = e.x ;
   mouseY = e.y ;
   circumference =  (2 * Math.PI) * 5;
//    console.log("whole")
//    console.log((mouseX + circumference/2))
//    console.log("half")
//    console.log((mouseX + circumference/2)/2)
//     console.log(circumference);
//    ctx.beginPath();
//         ctx.fillStyle = 'rgba(255,255,255, .5)';
//         ctx.arc(mouseX,mouseY,25,0,2 * Math.PI);
//         ctx.closePath();
//         ctx.fill();
})

