var c = document.getElementById("game");
var ctx = c.getContext("2d");
setTimeout(function(){c.style.opacity = 1;}, 250);

function sizeWindow() {
    c.width = document.body.clientWidth || self.innerWidth;
    c.height = document.body.clientHeight || self.innerHeight;
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}
function colorSet(clr) {
    player.color = clr;
    fadeCol(clr);
}

function fadeIO() {
    c.style.opacity = 0;
    setTimeout(function() {c.style.opacity = 1}, 200);
}
function fadeCol(thecolor) {
    c.style.background = thecolor;
    setTimeout(function() {c.style.background = "lightblue";}, 200);
}

var mouseX = 0, mouseY = 0, keys = [], mousePressed = false, menu = false;

document.addEventListener("mousemove", function(e) {mouseX = e.clientX; mouseY = e.clientY;});
document.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;

    if (keys[80]) {
        if (!paused) {
            paused = true;
            postToBoard("Paused");
        } else {
            paused = false;
            postToBoard("Unpaused");
        }
    }
    if (keys[79]) {
        if (!outlines) {
            fadeIO();
            setTimeout(function() {outlines = true;}, 100);
        } else {
            fadeIO();
            setTimeout(function() {outlines = false;}, 100);
        }
    }
    if (keys[77]) {
        if (!menu) {
            menu = true;
            document.getElementById("overlay").style.display = "block";
            setTimeout(function() {document.getElementById("overlay").style.opacity = 1;}, 25);
        } else {
            menu = false;
            document.getElementById("overlay").style.opacity = 0;
            setTimeout(function() {document.getElementById("overlay").style.display = "none"}, 300);
        }
    }
});
document.addEventListener("keyup", function(e) {keys[e.keyCode] = false});

var map = {
    output: [{text: "Welcome!", time: 100}, {text: "This is the message board. It tells you stuff.", time: 200}, {text:"Use WASD to move, P to pause, and M for menu.", time:400}],
    grass: [],
    clouds: [],
    trees: [],
    levels: [[]],
    levelMessages: [{msg: "Level editor v1", said: false}],
    currlevel: 0
}

for (var g = 0; g < 50; g += 1) {
    map.grass.push({height: Math.round(random(2, 4))*2, width: 4, x: (g*2-50)*10});
}
for (var cl = 0; cl < 20; cl += 1) {
    map.clouds.push({x: random(-2000, 2000), y: random(200, 500), op: random(2, 7)/10, s: random(100, 300), sp: random(1, 30)/10});
}
for (var t = 0; t < 4; t += 1) {
    map.trees.push({x: Math.round(random(-5.00, 4.50)+6.75)*100});
}

function postToBoard(txt, hl) {
    if (!hl) {
        hl = 400;
    }
    map.output.push({text: txt, time: hl});
}

var tpCoolDown = 0;

var ggui = false;
function toggleGui() {
    if (ggui) {
        ggui = false;
    } else {
        ggui = true;
    }
}

var totalFrames = 0;

var player = {
    x: 0,
    y: 0,
    xv: 0,
    yv: 0,
    overFloor: false,
    die: function() {
        player.x = 0;
        player.y = 0;
        player.xv = 0;
        player.yv = 0;
        fadeIO();
        postToBoard("ouch.");
        player.overFloor = false;
        player.deaths += 1
    },
    overIce: false,
    overStone: false,
    tps: 0,
    deaths: 0,
    nextLevel: function() {
        if (map.currlevel < map.levels.length-1) {
            map.currlevel ++;
            player.x = 0;
            player.y = 0;
            player.xv = 0;
            player.yv = 0;
            fadeIO();
            postToBoard("Level Up! (Level "+(map.currlevel+1)+")")
        }
    },
    setLevel: function(toWhat) {
        toWhat = Math.round(toWhat);
        if (toWhat <= map.levels.length && toWhat >= 1) {

            map.currlevel = toWhat-1;
            player.x = 0;
            player.y = 0;
            player.xv = 0;
            player.yv = 0;
            fadeIO();

            if (map.levelMessages[map.currlevel].said === true) {
                postToBoard(map.levelMessages[map.currlevel].msg);
            }
            postToBoard("Level is now level! (Level "+(map.currlevel+1)+")");
        }
    },
    color: "#777",
    shifting: false,
}
var achievements = [];

var paused = false;
var outlines = false;

function draw() {
    ctx.clearRect(0, 0, c.width, c.height);

    for (var g = 0; g < map.grass.length; g++) {
        ctx.fillStyle = "#4A3";
        ctx.strokeStyle = "#4A3";
        if (!outlines) {
            ctx.fillRect(map.grass[g].x-player.x+(c.width/2)-5, c.height/2-player.y-(map.grass[g].height-10), map.grass[g].width, map.grass[g].height);
        } else {
            ctx.strokeRect(map.grass[g].x-player.x+(c.width/2)-5, c.height/2-player.y-(map.grass[g].height-10), map.grass[g].width, map.grass[g].height);
        }
    }

    for (var t in map.trees) {
        if (!outlines) {
            ctx.fillStyle = "#661400";
            ctx.fillRect(map.trees[t].x-player.x, 150-player.y, 50, 200);
            ctx.fillStyle = "#2a4";
            ctx.fillRect(map.trees[t].x-player.x-10, 75-player.y, 70, 125);
        } else {
            ctx.strokeStyle = "#661400";
            ctx.strokeRect(map.trees[t].x-player.x, 150-player.y, 50, 200);
            ctx.strokeStyle = "#2a4";
            ctx.strokeRect(map.trees[t].x-player.x-10, 75-player.y, 70, 125);
        }
    }

    ctx.fillStyle = player.color;
    ctx.strokeStyle = player.color;
    if (!outlines) {
        ctx.fillRect(c.width/2-10, c.height/2-10, 20, 20);
        ctx.fillStyle = "rgba(250, 250, 250, 0.3)"
        ctx.beginPath();
        ctx.moveTo(c.width/2-10, c.height/2-10);
        ctx.lineTo(c.width/2+10, c.height/2-10);
        ctx.lineTo(c.width/2-10, c.height/2+10);
        ctx.fill();
    } else {
        ctx.strokeRect(c.width/2-10, c.height/2-10, 20, 20);
    }

    for (var b = 0; b < map.levels[map.currlevel].length; b ++) {
        ctx.fillStyle = "#AAA";
        ctx.strokeStyle="#AAA";
        if (map.levels[map.currlevel][b].type === "s" || map.levels[map.currlevel][b].type === "mp") {
            if (!outlines) {
                ctx.fillRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-10, map.levels[map.currlevel][b].y-player.y+(c.height/2)-10, 20, 20);
                ctx.fillStyle = "#999";
                ctx.fillRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-7.5, map.levels[map.currlevel][b].y-player.y+(c.height/2)-7.5, 15, 15);
            } else {
                ctx.strokeRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-10, map.levels[map.currlevel][b].y-player.y+(c.height/2)-10, 20, 20);
                ctx.strokeStyle = "#999";
                ctx.strokeRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-7.5, map.levels[map.currlevel][b].y-player.y+(c.height/2)-7.5, 15, 15);
            }
        } else if (map.levels[map.currlevel][b].type === "l") {
            ctx.fillStyle = "#F30";
            ctx.strokeStyle="#F30";
            if (!outlines) {
                ctx.fillRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-10, map.levels[map.currlevel][b].y-player.y+(c.height/2)-10, 20, 20);
                ctx.fillStyle = "#F42";
                ctx.fillRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-7.5, map.levels[map.currlevel][b].y-player.y+(c.height/2)-7.5, 15, 15);
            } else {
                ctx.strokeRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-10, map.levels[map.currlevel][b].y-player.y+(c.height/2)-10, 20, 20);
                ctx.strokeStyle = "#F42";
                ctx.strokeRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-7.5, map.levels[map.currlevel][b].y-player.y+(c.height/2)-7.5, 15, 15);
            }
        } else if (map.levels[map.currlevel][b].type === "b") {
            ctx.fillStyle = "#A0A";
            ctx.strokeStyle="#A0A";
            if (!outlines) {
                ctx.fillRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-10, map.levels[map.currlevel][b].y-player.y+(c.height/2)+6, 20, 4);
            } else {
                ctx.strokeRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-10, map.levels[map.currlevel][b].y-player.y+(c.height/2)+6, 20, 4);
            }
        } else if (map.levels[map.currlevel][b].type === "i") {
            ctx.fillStyle = "#9BF";
            ctx.strokeStyle="#9BF";
            if (!outlines) {
                ctx.fillRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-10, map.levels[map.currlevel][b].y-player.y+(c.height/2)-10, 20, 20);
                ctx.fillStyle = "#8AE";
                ctx.fillRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-10, map.levels[map.currlevel][b].y-player.y+(c.height/2)-10, 20, 5);
            } else {
                ctx.strokeRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-10, map.levels[map.currlevel][b].y-player.y+(c.height/2)-10, 20, 20);
                ctx.strokeStyle = "#8AE";
                ctx.strokeRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-10, map.levels[map.currlevel][b].y-player.y+(c.height/2)-10, 20, 5);
            }
        }  else if (map.levels[map.currlevel][b].type === "tp") {
            ctx.fillStyle = "#0BF";
            ctx.strokeStyle="#0BF";
            if (!outlines) {
                ctx.fillRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-10, map.levels[map.currlevel][b].y-player.y+(c.height/2)-10, 20, 20);
                ctx.fillStyle = "#FB0";
                ctx.fillRect(map.levels[map.currlevel][b].x1-player.x+(c.width/2)-10, map.levels[map.currlevel][b].y1-player.y+(c.height/2)-10, 20, 20);
            } else {
                ctx.strokeRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-10, map.levels[map.currlevel][b].y-player.y+(c.height/2)-10, 20, 20);
                ctx.strokeStyle="#FB0";
                ctx.strokeRect(map.levels[map.currlevel][b].x1-player.x+(c.width/2)-10, map.levels[map.currlevel][b].y1-player.y+(c.height/2)-10, 20, 20);
            }
        } else if (map.levels[map.currlevel][b].type === "g") {
            ctx.fillStyle = "#9F9";
            ctx.strokeStyle = "#9F9";
            var _ = random(-2, 2);
            var __ = random(-2, 2);
            if (!outlines) {
                ctx.fillRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-10+_, map.levels[map.currlevel][b].y-player.y+(c.height/2)-10+__, 20, 20);
            } else {
                ctx.strokeRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-10+_, map.levels[map.currlevel][b].y-player.y+(c.height/2)-10+__, 20, 20);
            }
            ctx.fillStyle = "#5A5";
            ctx.strokeStyle = "#5A5";
            if (!outlines) {
                ctx.fillRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-7.5+(_*2), map.levels[map.currlevel][b].y-player.y+(c.height/2)-7.5+(__*2), 15, 15);
            } else {
                ctx.strokeRect(map.levels[map.currlevel][b].x-player.x+(c.width/2)-7.5+(_*2), map.levels[map.currlevel][b].y-player.y+(c.height/2)-7.5+(__*2), 15, 15);
            }
            _ = undefined;
            __ = undefined;
        } else {

        }
    }

    ctx.fillStyle = "#2D5";
    ctx.strokeStyle = "#2D5";
    if (!outlines) {
        ctx.fillRect(c.width/2-507.5-player.x, (c.height/2+10)-player.y, 997.5, (c.height/2+10)+player.y);
    } else {
        ctx.strokeRect(c.width/2-507.5-player.x, (c.height/2+10)-player.y, 997.5, (c.height/2+10)+player.y);
    }
    ctx.fillStyle = "#801a00";
    ctx.strokeStyle = "#801a00";
    if (!outlines) {
        ctx.fillRect(c.width/2-507.5-player.x, (c.height/2+50)-player.y, 997.5, (c.height/2+50)+player.y);
    } else {
        ctx.strokeRect(c.width/2-507.5-player.x, (c.height/2+50)-player.y, 997.5, (c.height/2+50)+player.y);
    }
    ctx.fillStyle = "#400600";
    ctx.strokeStyle = "#400600";
    if (!outlines) {
        ctx.fillRect(c.width/2-507.5-player.x, (c.height/2+150)-player.y, 997.5, (c.height/2+150)+player.y);
    } else {
        ctx.strokeRect(c.width/2-507.5-player.x, (c.height/2+150)-player.y, 997.5, (c.height/2+150)+player.y);
    }
    ctx.fillStyle = "#555";
    ctx.strokeStyle = "#555";
    if (!outlines) {
        ctx.fillRect(c.width/2-507.5-player.x, (c.height/2+300)-player.y, 997.5, (c.height/2+300)+player.y);
    } else {
        ctx.strokeRect(c.width/2-507.5-player.x, (c.height/2+300)-player.y, 997.5, (c.height/2+300)+player.y);
    }

    ctx.fillStyle = "#09e";
    ctx.strokeStyle = "#09e";
    if (!outlines) {
        ctx.fillRect(0, (c.height/2+310+Math.sin(totalFrames/50)*10)-player.y, c.width, (c.height/2+300)+player.y);
    } else {
        ctx.strokeRect(0, (c.height/2+310)-player.y, c.width, (c.height/2+300)+player.y);
    }

    for (var cl = 0; cl < map.clouds.length; cl++) {
        ctx.fillStyle = "rgba(255, 255, 255, "+map.clouds[cl].op+")";
        ctx.strokeStyle = "#FFF";
        if (!outlines) {
            ctx.fillRect(map.clouds[cl].x-player.x+(c.width/2)-5, c.height/2-player.y-(map.clouds[cl].y), map.clouds[cl].s, 100);
        } else {
            ctx.strokeRect(map.clouds[cl].x-player.x+(c.width/2)-5, c.height/2-player.y-(map.clouds[cl].y), map.clouds[cl].s, 100);
        }
        map.clouds[cl].x += map.clouds[cl].sp;
        if (map.clouds[cl].x > 2000) {
          map.clouds[cl].x = -2100
        }
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    if (ggui) {ctx.fillRect(5, 0, 190, 25);}
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.font="20px Open Sans Condensed, arial";
    if (ggui) {
        ctx.fillText("x:"+Math.round(player.x)+" y:"+Math.round(player.y)+" yv:"+Math.round(player.yv)+" xv:"+Math.round(player.xv)+" deaths:"+player.deaths, 10, 20);
    }
    var oty = 45;
    var anyText = false;
    for (var t = 0; t < map.output.length; t ++) {
        if (map.output[t].time > 0) {
            map.output[t].time -= 1;
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
            ctx.fillRect(10, oty-20, map.output[t].text.length*10, 25);
            ctx.fillStyle = "rgba(255, 255, 255, "+map.output[t].time/100+")";
            ctx.fillText(map.output[t].text, 20, oty);
            anyText = true;
            oty += 30;
        } else {
            //Why is this even here???
        }
    }
    //Cleaning the board if there is nothing in it.
    if (!anyText) {
        map.output = []; //Variables in lists add up, so this will keep this list clean.
    }

    anyText = undefined;
    oty = undefined;

    if (!paused) {
        if (tpCoolDown > 0) {
            tpCoolDown --;
        }
        if (player.yv > 9) {
            player.yv = 9;
        }
        player.y += player.yv;
        player.x += player.xv;

        if (!menu) {
            if (keys[87]) {
                player.yv -= 1;
            }
            if (keys[65]) {
                player.xv -= 1;
            }
            if (keys[68]) {
                player.xv += 1;
            }
            if (keys[83]) {
                player.yv += 1;
            }
            if (keys[16] && map.currlevel > 8) {
                player.shifting = true;
            }
        }

        player.x = Math.round(player.x*100)/100;
        player.xv *= 0.89;
        player.xv = Math.round(player.xv*10000)/10000;
        player.yv *= 0.89;
        player.yv = Math.round(player.yv*10000)/10000;
        player.onMP = [false, 0];

        for (var ms = 0; ms < map.levelMessages.length; ms ++) {
            if (map.currlevel === ms && map.levelMessages[ms].said === false) {
                map.levelMessages[ms].said = true;
                postToBoard(map.levelMessages[ms].msg);
            }
        }

        if (player.shifting) {
            player.xv *= 0.87;
        }

        player.overStone = false;
        player.overIce = false; //I put this here so I could add the "Slippery!" achievement
        player.shifting = false;
    }
    totalFrames++;
}

setInterval(draw, 20);
sizeWindow();
