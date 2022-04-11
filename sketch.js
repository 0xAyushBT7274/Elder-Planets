/***********************************************************************
     
 Copyright (c) 2008, 2009, Ayush Mishra, www.Ayushmishra.design
 *** Ayush Mishra Designs ***
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of MSA Visuals nor the names of its contributors
 *       may be used to endorse or promote products derived from this software
 *       without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS
 * OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***********************************************************************/
//Color Palette
const planetCols = ["#F4F1DE", "#E07A5F", "#3D405B", "#81B29A", "#F2CC8F"];
const ringCols = ["#fe938c","#e6b89c", "#ead2ac", "#9cafb7", "#4281a4"];
const xDiv = 3; //x divisions
const yDiv = 2; //y divisions
const padding = 70;

let yRot = 45;
let xStep, yStep;
let bg, img;
let planet, planets;



/*------------------MAIN FUNCTIONS----------------*/

function setup() {
    createCanvas(1000, 700, WEBGL);
    angleMode(DEGREES);

    //Calculating subdivision size
    xStep = (width - padding * 2) / xDiv;
    yStep = (height - padding * 2) / yDiv;

    //Initializ planets
    planets = [];
    for (let y = 0; y < yDiv; y++){
        for (let x = 0; x < xDiv; x++){
            let cenX = x * xStep + xStep / 2;
            let cenY = y * yStep + yStep / 2;
            let r = min(xStep, yStep) / 3.5;
            planets.push(generatePlanet(cenX, cenY, r));
        }
    }
    //Creating background image
    bg = stellaBackground(0.01)
}


function draw() {
    //Place backgrond Image
    push();
    translate(0, 0, -1000)
    imageMode(CENTER);
    image(bg, 0, 0)
    pop();
    
    //Using ortho mode
    ortho();

    //Lighting Control
    let ambientCol = color(150);
    let lightCol = color(160);
    ambientLight(ambientCol);
    pointLight(lightCol, -width/2, -height/3, 200);
    
    //Visualizing planets
    translate(-width/2 + padding, -height/2 + padding)
    planets.forEach(planet => {
        push();
        translate(planet.cen.x, planet.cen.y);
        planet.display();
        pop();
    });
    yRot += 1;
}



/*---------------- HELPER FUNCTIONS --------------*/

//Randomly generate a planet
function generatePlanet(cenX, cenY, radius){
    let cen = createVector(cenX, cenY, 0);
    //Selecting color combinations
    let colIdx1 = int(random(0, planetCols.length));
    let colIdx2 = int(random(0, planetCols.length));
    let ringColIdx = int(random(0, ringCols.length));
    while (colIdx1 == colIdx2) colIdx2 = int(random(0, planetCols.length));
    let col1 = color(planetCols[colIdx1]);
    let col2 = color(planetCols[colIdx2]);
    let ringCol = color(ringCols[ringColIdx]);

    //Generating a texture for the new planet
    let mode = random();
    let texture;
    if (mode > 0.5){
        //Mode A: strips
        let noiseScaleX = 0.01;
        let noiseScaleY = random(0.08, 0.18);
        texture = noiseTexture(col1, col2, noiseScaleX, noiseScaleY);
    } else {
        //Mode B: noise graphs
        let noiseScale = random(0.04, 0.08);
        texture = noiseTexture(col1, col2, noiseScale, noiseScale);
    }

    return new Planet(cen, radius, texture, ringCol);
}


//Generating random texture
//Reference: https://openprocessing.org/sketch/897414
function noiseTexture(col1, col2, noiseScaleX, noiseScaleY){
    let tex = createGraphics(200, 200);
    tex.noStroke();
    for (let y = 0; y < tex.height; y++){
        for (let x = 0; x < tex.width; x++){
            //let nx = x;
            let nx = abs(tex.width/2-x);
            let nv = noise(nx * noiseScaleX, y * noiseScaleY);
            nv = Math.floor(nv * 4) / 4;
            tex.fill(lerpColor(col1, col2, nv));
            tex.rect(x, y, 1, 1)
        }
    }
    return tex;
}


//Creating a stella background
function stellaBackground(noiseScale){
    let scale = 3;
    let w = width * scale;
    let h = height * scale;
    let bg = createGraphics(w, h);
    bg.background("#293241")
    bg.noStroke();
    for (let i = 0; i < 3000; i++){
        let x = random(w);
        let y = random(h);
        let alpha = noise(x * noiseScale, y * noiseScale);
        let fillCol = color("#f1faee");
        fillCol.setAlpha(alpha * 150)
        bg.fill(fillCol);
        bg.rect(x, y, scale, scale);
    }
    return bg;
}



/*------------------CLASS---------------------*/

//Planet Class
class Planet{
    constructor(center, radius, texture, ringCol){
        this.cen = center;
        this.r = radius;
        this.ringR = radius / 4 * random(0.7, 1.0);
        this.texture = texture;
        this.ringCol = ringCol;
        this.ringCount = int(random(0, 6));
    }

    display(){
        //Showing the planet
        push();
        rotateZ(-45);
        rotateX(-25);
        rotateY(yRot);
        texture(this.texture);
        noStroke();
        sphere(this.r, 48, 48);
        pop();

        //Displaying the ring
        let startR = this.r * 1.3;
        let r = this.ringR / this.ringCount;        
        if (this.ringCount == 1){
            startR *= 1.1; //Avoid the ring touching the sphere
            r *= 0.9;
        }

        let gap = map(this.ringCount, 0, 5, 10, 2);
        push();
        rotateZ(45);
        rotateY(-70);
        this.ringCol.setAlpha(100);
        scale(1.0, 1.0, 0.1)
        for (let i = 0; i < this.ringCount; i++){
            let currR = startR + i * (r * 2) + i * gap;
            fill(this.ringCol);
            noStroke();
            torus(currR, r, 60);
            }
        pop();
        }
}