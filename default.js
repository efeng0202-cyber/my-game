// ==========================================================
// CASH LIFE SIMULATOR
// Pick a career and how you live, play 3 months of choices,
// then see a forecast of your money after 7 years.
//
// Every month has 3 steps:
//   1. SURPRISE - something happens, you decide what to do
//   2. INVEST   - decide what to do with your cash
//   3. RESULTS  - see your paycheck, bills and what changed
// ==========================================================

var MAX_MONTHS = 3;
var FORECAST_YEARS = 7;
var FORECAST_MONTHS = FORECAST_YEARS * 12;
var START_CASH = 1000;

// ---------- colors ----------
var NAVY = "#1B2A49";
var BLUE = "#3D7FE0";
var GREEN = "#2BB673";
var ORANGE = "#F2994A";
var RED = "#E2574C";
var PURPLE = "#8E6BBF";
var GOLD = "#FFC145";
var BG = "#E8F0FB";
var WHITE = "#FFFFFF";
var INK = "#22304A";
var MUTED = "#6B7A99";
var SHADOW = "#C3D0E6";
var GRAYBLUE = "#8FA3C8";

// ---------- who you are ----------
var playerName = "Player";
var playerGender = "";
var selectedJob = "";
var selectedWage = 0;
var characterColor = "#4285D4";

// ---------- how you live ----------
var selectedFood = "";
var foodCost = 0;
var foodLevel = 0;
var selectedHousing = "";
var housingCost = 0;
var housingLevel = 0;
var selectedTransport = "";
var transportCost = 0;
var transportLevel = 0;
var setupMode = true;

// ---------- the game ----------
var month = 0;
var cash = START_CASH;
var savings = 0;
var stocks = 0;
var investGain = 0;
var monthStartWorth = 0;
var eventOrder = [];
var currentEvent = null;
var eventReport = null;
var monthReport = null;
var lifestyleBack = null;

var buttons = [];

var jobs = [
    {name:"Fast Food", wage:2000, icon:"F"},
    {name:"Retail Clerk", wage:2200, icon:"R"},
    {name:"Delivery Driver", wage:2500, icon:"D"},
    {name:"Barista", wage:2100, icon:"B"},
    {name:"Painter", wage:3000, icon:"P"},
    {name:"Writer", wage:2800, icon:"W"},
    {name:"Graphic Designer", wage:3200, icon:"G"},
    {name:"Teacher", wage:3800, icon:"T"},
    {name:"Chef", wage:4000, icon:"C"},
    {name:"Accountant", wage:4200, icon:"A"},
    {name:"Scientist", wage:4500, icon:"S"},
    {name:"Real Estate", wage:5000, icon:"E"},
    {name:"Investor", wage:5500, icon:"I"},
    {name:"Software Engineer", wage:6000, icon:"M"},
    {name:"Lawyer", wage:7500, icon:"L"},
    {name:"Doctor", wage:8500, icon:"H"}
];

var foods = [
    {name:"Instant Noodles", cost:150, desc:"Cheap, but not very healthy"},
    {name:"Home Cooking", cost:300, desc:"Budget friendly and healthy"},
    {name:"Fast Food", cost:450, desc:"Quick and convenient"},
    {name:"Restaurants", cost:700, desc:"Tasty meals out every week"},
    {name:"Meal Delivery", cost:900, desc:"Fancy food brought to your door"}
];

var housing = [
    {name:"Roommates", cost:500, desc:"Share a place with friends"},
    {name:"Studio Apartment", cost:900, desc:"Small, but all yours"},
    {name:"1-Bedroom Apartment", cost:1300, desc:"Comfortable and private"},
    {name:"Nice Condo", cost:2000, desc:"Modern with a great view"},
    {name:"Big House", cost:3000, desc:"Lots of space and a yard"}
];

var transport = [
    {name:"Walk / Bike", cost:0, desc:"Free and good exercise"},
    {name:"Bus Pass", cost:100, desc:"Cheap and reliable"},
    {name:"Used Car", cost:350, desc:"Gets you around town"},
    {name:"New Car", cost:700, desc:"Fast, safe and shiny"}
];

// Surprises. Every one has a choice that costs nothing.
// cash = money in or out, savings/stocks = money put straight there,
// cost + chance + win + lose = a gamble.
var events = [
    {title:"Laptop Trouble!", icon:"warning", color:ORANGE,
     text:"Your laptop suddenly stopped working. You need it for work.",
     options:[
        {label:"Repair it", sub:"A cheap fix, good as new", cash:-150},
        {label:"Buy a new one", sub:"Faster and shinier", cash:-600},
        {label:"Borrow a friend's", sub:"Free, but a little annoying", cash:0}]},
    {title:"Concert Night!", icon:"star", color:PURPLE,
     text:"Your friends invite you to see your favorite band this weekend.",
     options:[
        {label:"VIP tickets", sub:"Front row, best night ever", cash:-300},
        {label:"Cheap seats", sub:"Still lots of fun", cash:-80},
        {label:"Stay home", sub:"Save your money", cash:0}]},
    {title:"Lucky Find!", icon:"gift", color:GREEN,
     text:"You found $500 in an old jacket pocket!",
     options:[
        {label:"Keep the cash", sub:"Ready to spend", cash:500},
        {label:"Save it", sub:"Goes into your savings", savings:500},
        {label:"Try your luck", sub:"Win $1,500, or get nothing",
         chance:0.25, win:1500, lose:0, tag:"25% chance"}]},
    {title:"Sneaker Sale!", icon:"star", color:PURPLE,
     text:"Your favorite sneakers are 50% off today only!",
     options:[
        {label:"Buy one pair", sub:"A great deal", cash:-120},
        {label:"Buy three pairs!", sub:"So many shoes", cash:-360},
        {label:"Skip the sale", sub:"Keep your money", cash:0}]},
    {title:"Weekend Job!", icon:"coin", color:"#E0A100",
     text:"A neighbor offers you weekend work. Or you could try a bigger idea.",
     options:[
        {label:"Help with a garage sale", sub:"Easy money for the weekend", cash:250},
        {label:"Start a snack stand", sub:"Costs $200. Could pay off big",
         cost:200, chance:0.5, win:900, lose:0, tag:"50% chance"},
        {label:"Rest all weekend", sub:"No work, no spending", cash:0}]},
    {title:"Cracked Phone!", icon:"warning", color:ORANGE,
     text:"You dropped your phone and the screen shattered.",
     options:[
        {label:"Fix the screen", sub:"Repair shop special", cash:-150},
        {label:"Buy a new phone", sub:"The latest model", cash:-500},
        {label:"Use it cracked", sub:"Looks bad, but free", cash:0}]},
    {title:"Birthday Gift!", icon:"gift", color:GREEN,
     text:"Your grandparents sent you $300 for your birthday!",
     options:[
        {label:"Keep the cash", sub:"Ready to spend", cash:300},
        {label:"Save it", sub:"Goes into your savings", savings:300},
        {label:"Buy stocks", sub:"Goes into stocks (risky)", stocks:300}]},
    {title:"Charity Run!", icon:"star", color:PURPLE,
     text:"A coworker asks you to sponsor their charity run.",
     options:[
        {label:"Donate $100", sub:"Very generous", cash:-100},
        {label:"Donate $20", sub:"Every bit helps", cash:-20},
        {label:"Maybe next time", sub:"No donation", cash:0}]}
];

var skyThemes = [
    {top:"#69BDF0", bottom:"#EAF7FF", bld:"#9DB8D6", win:"#DCEBF8", sun:"day", stars:false, clouds:true},
    {top:"#F58F6A", bottom:"#FFE8C2", bld:"#B07A8F", win:"#FFD9A0", sun:"set", stars:false, clouds:true},
    {top:"#121A3C", bottom:"#3E5290", bld:"#0C1330", win:"#FFE59A", sun:"moon", stars:true, clouds:false}
];

var skyline = [[0,34,70],[30,26,104],[58,40,62],[100,30,124],[132,36,86],[170,28,66],
               [200,40,112],[242,30,78],[274,34,98],[310,28,60],[340,30,90],[372,28,68]];

var starSpots = [[30,70],[70,118],[110,60],[150,98],[190,48],[240,78],[280,128],
                 [360,66],[382,136],[18,150],[130,160],[225,138]];


// ==========================================================
// DRAWING HELPERS
// ==========================================================

function hexToRgb(h) {
    return [parseInt(h.substring(1, 3), 16),
            parseInt(h.substring(3, 5), 16),
            parseInt(h.substring(5, 7), 16)];
}

function toHex2(n) {
    var s = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return s.length < 2 ? "0" + s : s;
}

function mixColor(c1, c2, t) {
    var a = hexToRgb(c1);
    var b = hexToRgb(c2);
    return "#" + toHex2(a[0] + (b[0] - a[0]) * t) +
                 toHex2(a[1] + (b[1] - a[1]) * t) +
                 toHex2(a[2] + (b[2] - a[2]) * t);
}

function darken(c, f) { return mixColor(c, "#000000", f); }
function lighten(c, f) { return mixColor(c, "#FFFFFF", f); }

function rect(x, y, w, h, color) {
    var r = new Rectangle(w, h);
    r.setPosition(x, y);
    r.setColor(color);
    add(r);
    return r;
}

function circ(x, y, radius, color) {
    var c = new Circle(radius);
    c.setPosition(x, y);
    c.setColor(color);
    add(c);
    return c;
}

function line(x1, y1, x2, y2, color, width) {
    var l = new Line(x1, y1, x2, y2);
    l.setColor(color);
    l.setLineWidth(width);
    add(l);
    return l;
}

function poly(points, color) {
    var p = new Polygon();
    for (var i = 0; i < points.length; i++) {
        p.addPoint(points[i][0], points[i][1]);
    }
    p.setColor(color);
    add(p);
    return p;
}

// Rectangle with round corners
function roundRect(x, y, w, h, r, color) {
    if (r > h / 2) { r = h / 2; }
    if (r > w / 2) { r = w / 2; }
    rect(x + r, y, w - 2 * r, h, color);
    rect(x, y + r, w, h - 2 * r, color);
    circ(x + r, y + r, r, color);
    circ(x + w - r, y + r, r, color);
    circ(x + r, y + h - r, r, color);
    circ(x + w - r, y + h - r, r, color);
}

// White-ish panel with a soft shadow underneath
function card(x, y, w, h, color) {
    roundRect(x, y + 3, w, h, 10, SHADOW);
    roundRect(x, y, w, h, 10, color);
}

function textWidth(txt, size, bold) {
    var t = new Text(txt, (bold ? "bold " : "") + size + "pt Arial");
    return t.getWidth();
}

function addText(txt, x, y, size, color, bold) {
    var t = new Text(txt, (bold ? "bold " : "") + size + "pt Arial");
    t.setPosition(x, y);
    t.setColor(color);
    add(t);
    return t;
}

function addCenteredIn(txt, cx, y, size, color, bold) {
    return addText(txt, cx - textWidth(txt, size, bold) / 2, y, size, color, bold);
}

function addCenteredText(txt, y, size, color, bold) {
    return addCenteredIn(txt, 200, y, size, color, bold);
}

function addRightText(txt, xr, y, size, color, bold) {
    return addText(txt, xr - textWidth(txt, size, bold), y, size, color, bold);
}

function wrapLines(txt, size, maxW, bold) {
    var words = txt.split(" ");
    var lines = [];
    var cur = "";
    for (var i = 0; i < words.length; i++) {
        var test = (cur.length == 0) ? words[i] : cur + " " + words[i];
        if (cur.length > 0 && textWidth(test, size, bold) > maxW) {
            lines.push(cur);
            cur = words[i];
        } else {
            cur = test;
        }
    }
    if (cur.length > 0) { lines.push(cur); }
    return lines;
}

function addParagraph(txt, cx, y, size, color, maxW, lineH, bold) {
    var lines = wrapLines(txt, size, maxW, bold);
    for (var i = 0; i < lines.length; i++) {
        addCenteredIn(lines[i], cx, y + i * lineH, size, color, bold);
    }
    return y + lines.length * lineH;
}

function shortName(n) {
    if (n.length > 14) { return n.substring(0, 14) + "..."; }
    return n;
}

// Big rounded button with a shadow. Label is centered.
function addButton(txt, x, y, w, h, color, action, size) {
    if (!size) { size = 11; }
    roundRect(x, y + 3, w, h, 10, darken(color, 0.3));
    roundRect(x, y, w, h, 10, color);
    addCenteredIn(txt, x + w / 2, y + h / 2 + Math.round(size * 0.48), size, WHITE, true);
    buttons.push({x:x, y:y, w:w, h:h, action:action});
}

function money(n) {
    var sign = n < 0 ? "-" : "";
    var s = String(Math.abs(Math.round(n)));
    var out = "";
    while (s.length > 3) {
        out = "," + s.substring(s.length - 3) + out;
        s = s.substring(0, s.length - 3);
    }
    return sign + "$" + s + out;
}

// +$500 or -$150
function signedMoney(n) {
    return (n >= 0 ? "+" : "-") + money(Math.abs(n));
}

// $724K or $1.2M
function compact(n) {
    var v = Math.abs(n);
    var s;
    if (v >= 1000000) { s = (Math.round(v / 100000) / 10) + "M"; }
    else if (v >= 1000) { s = Math.round(v / 1000) + "K"; }
    else { s = String(Math.round(v)); }
    return (n < 0 ? "-" : "") + "$" + s;
}

function resetScreen() {
    removeAll();
    buttons = [];
}

function clearScreen(color) {
    resetScreen();
    rect(0, 0, 400, 400, color);
}

// Dark bar across the top with a title (and optional text on the right)
function drawTopBar(title, rightText, rightColor) {
    rect(0, 0, 400, 36, NAVY);
    rect(0, 36, 400, 3, GOLD);
    addText(title, 16, 24, 12, WHITE, true);
    if (rightText) {
        addRightText(rightText, 384, 23, 10, rightColor, true);
    }
}

// Three little pills that show which step you are on
function drawStepPills(labels, step) {
    for (var i = 0; i < 3; i++) {
        var x = 20 + i * 124;
        var fill = "#C9D5EA";
        var tc = MUTED;
        if (i + 1 < step) { fill = GREEN; tc = WHITE; }
        if (i + 1 == step) { fill = GOLD; tc = NAVY; }
        roundRect(x, 45, 112, 18, 9, fill);
        addCenteredIn(labels[i], x + 56, 58, 8, tc, true);
    }
}

function drawMonthHeader(n, step) {
    drawTopBar("MONTH " + n + " OF " + MAX_MONTHS,
               "Cash: " + money(cash), GOLD);
    drawStepPills(["1  SURPRISE", "2  INVEST", "3  RESULTS"], step);
}

// Small info box: tiny label above a value
function drawChip(x, y, w, label, value, color) {
    card(x, y, w, 34, WHITE);
    rect(x + 8, y + 7, 4, 20, color);
    addText(label, x + 18, y + 14, 7, MUTED, true);
    addText(value, x + 18, y + 28, 10, INK, true);
}


// ==========================================================
// ICONS (drawn in white on a colored circle)
// ==========================================================
function drawIcon(kind, x, y, s, bgc) {
    var i;

    if (kind == "coin") {
        circ(x, y, 10 * s, GOLD);
        circ(x, y, 7.5 * s, lighten(GOLD, 0.45));
        addCenteredIn("$", x, y + Math.round(4 * s), Math.round(9 * s), darken(GOLD, 0.45), true);
    }
    if (kind == "house") {
        poly([[x - 11 * s, y - 1 * s], [x, y - 11 * s], [x + 11 * s, y - 1 * s]], WHITE);
        rect(x - 8 * s, y - 1 * s, 16 * s, 11 * s, WHITE);
        rect(x - 2 * s, y + 3 * s, 4 * s, 7 * s, bgc);
    }
    if (kind == "car") {
        roundRect(x - 12 * s, y - 2 * s, 24 * s, 9 * s, 3 * s, WHITE);
        roundRect(x - 7 * s, y - 8 * s, 14 * s, 8 * s, 3 * s, WHITE);
        circ(x - 6 * s, y + 8 * s, 3.5 * s, darken(bgc, 0.4));
        circ(x + 6 * s, y + 8 * s, 3.5 * s, darken(bgc, 0.4));
    }
    if (kind == "food") {
        circ(x, y - 2 * s, 8 * s, WHITE);
        rect(x - 10 * s, y - 1 * s, 20 * s, 3 * s, bgc);
        roundRect(x - 9 * s, y + 3 * s, 18 * s, 6 * s, 2 * s, WHITE);
    }
    if (kind == "chart") {
        rect(x - 9 * s, y + 1 * s, 5 * s, 8 * s, WHITE);
        rect(x - 2 * s, y - 4 * s, 5 * s, 13 * s, WHITE);
        rect(x + 5 * s, y - 9 * s, 5 * s, 18 * s, WHITE);
    }
    if (kind == "bank") {
        poly([[x - 11 * s, y - 3 * s], [x, y - 11 * s], [x + 11 * s, y - 3 * s]], WHITE);
        rect(x - 8 * s, y - 1 * s, 3 * s, 9 * s, WHITE);
        rect(x - 1.5 * s, y - 1 * s, 3 * s, 9 * s, WHITE);
        rect(x + 5 * s, y - 1 * s, 3 * s, 9 * s, WHITE);
        rect(x - 11 * s, y + 9 * s, 22 * s, 3 * s, WHITE);
    }
    if (kind == "warning") {
        poly([[x, y - 11 * s], [x + 11 * s, y + 9 * s], [x - 11 * s, y + 9 * s]], WHITE);
        addCenteredIn("!", x, y + Math.round(7 * s), Math.round(10 * s), bgc, true);
    }
    if (kind == "gift") {
        rect(x - 9 * s, y - 1 * s, 18 * s, 11 * s, WHITE);
        rect(x - 11 * s, y - 5 * s, 22 * s, 5 * s, WHITE);
        rect(x - 1.5 * s, y - 5 * s, 3 * s, 15 * s, bgc);
        circ(x - 3.5 * s, y - 8 * s, 3.5 * s, WHITE);
        circ(x + 3.5 * s, y - 8 * s, 3.5 * s, WHITE);
    }
    if (kind == "star") {
        var pts = [];
        for (i = 0; i < 10; i++) {
            var rad = (i % 2 == 0) ? 11 * s : 4.5 * s;
            var ang = (-90 + i * 36) * Math.PI / 180;
            pts.push([x + rad * Math.cos(ang), y + rad * Math.sin(ang)]);
        }
        poly(pts, WHITE);
    }
}

// Colored circle with an icon inside
function drawBadge(kind, x, y, r, color) {
    circ(x, y + 2, r, darken(color, 0.25));
    circ(x, y, r, color);
    drawIcon(kind, x, y, r / 15, color);
}


// ==========================================================
// SCENERY
// ==========================================================
function bandColor(theme, y) {
    var band = Math.floor(y / 25);
    if (band > 15) { band = 15; }
    return mixColor(theme.top, theme.bottom, band / 15);
}

function drawCloud(x, y) {
    circ(x, y, 10, WHITE);
    circ(x + 13, y - 5, 13, WHITE);
    circ(x + 28, y, 10, WHITE);
    rect(x, y, 28, 10, WHITE);
}

function drawSky(theme) {
    for (var i = 0; i < 16; i++) {
        rect(0, i * 25, 400, 26, mixColor(theme.top, theme.bottom, i / 15));
    }
    if (theme.sun == "day") {
        circ(352, 84, 19, lighten("#FFD166", 0.55));
        circ(352, 84, 13, "#FFD166");
    }
    if (theme.sun == "set") {
        circ(310, 322, 44, "#FFB78A");
        circ(310, 322, 32, "#FF8C5A");
    }
    if (theme.sun == "moon") {
        circ(352, 86, 14, "#FFF4C2");
        circ(358, 81, 12, bandColor(theme, 81));
    }
    if (theme.stars) {
        for (var s = 0; s < starSpots.length; s++) {
            circ(starSpots[s][0], starSpots[s][1], 1.4, WHITE);
        }
    }
    if (theme.clouds) {
        drawCloud(36, 82);
        drawCloud(110, 76);
    }
}

function drawSkyline(theme) {
    for (var b = 0; b < skyline.length; b++) {
        var bx = skyline[b][0];
        var bw = skyline[b][1];
        var bh = skyline[b][2];
        rect(bx, 400 - bh, bw, bh, theme.bld);
        var cols = Math.floor((bw - 6) / 9);
        var rows = Math.floor((bh - 10) / 14);
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                if ((r * 3 + c * 5 + b) % 3 != 0) {
                    rect(bx + 5 + c * 9, 400 - bh + 8 + r * 14, 4, 6, theme.win);
                }
            }
        }
    }
}

function drawScene(theme) {
    drawSky(theme);
    drawSkyline(theme);
}


// ==========================================================
// CHARACTER
// (cx, cy) = middle of the head, s = size (1 = normal)
// ==========================================================
function drawCharacter(cx, cy, s) {
    var skin = "#F3C49B";
    var girl = (playerGender == "Girl");
    var hair = girl ? "#7A4A2A" : "#3B2A20";
    var job = selectedJob;

    var coat = (job == "Doctor" || job == "Scientist");
    var formal = (job == "Lawyer" || job == "Accountant" ||
                  job == "Investor" || job == "Real Estate");
    var glasses = (job == "Teacher" || job == "Accountant" ||
                   job == "Graphic Designer");

    var top = characterColor;
    if (coat) { top = "#FFFFFF"; }
    if (formal) { top = "#2F3E5C"; }
    var pants = formal ? "#222B40" : "#33415F";

    // long hair goes behind everything
    if (girl) {
        roundRect(cx - 24 * s, cy - 6 * s, 48 * s, 46 * s, 14 * s, hair);
    }

    // legs and shoes
    rect(cx - 13 * s, cy + 62 * s, 11 * s, 24 * s, pants);
    rect(cx + 2 * s, cy + 62 * s, 11 * s, 24 * s, pants);
    roundRect(cx - 16 * s, cy + 84 * s, 15 * s, 8 * s, 3 * s, "#1E1E1E");
    roundRect(cx + 1 * s, cy + 84 * s, 15 * s, 8 * s, 3 * s, "#1E1E1E");

    // arms and hands
    roundRect(cx - 28 * s, cy + 26 * s, 11 * s, 32 * s, 5 * s, top);
    roundRect(cx + 17 * s, cy + 26 * s, 11 * s, 32 * s, 5 * s, top);
    circ(cx - 22 * s, cy + 60 * s, 5 * s, skin);
    circ(cx + 22 * s, cy + 60 * s, 5 * s, skin);

    // neck and body
    rect(cx - 5 * s, cy + 14 * s, 10 * s, 12 * s, skin);
    roundRect(cx - 19 * s, cy + 22 * s, 38 * s, 44 * s, 8 * s, top);

    if (coat) {
        rect(cx - 4 * s, cy + 24 * s, 8 * s, 40 * s, characterColor);
    }
    if (formal) {
        var tieColor = (job == "Lawyer") ? RED : ((job == "Investor") ? GREEN : GOLD);
        poly([[cx - 7 * s, cy + 22 * s], [cx + 7 * s, cy + 22 * s], [cx, cy + 36 * s]], WHITE);
        poly([[cx - 3 * s, cy + 31 * s], [cx + 3 * s, cy + 31 * s],
              [cx + 4 * s, cy + 56 * s], [cx, cy + 60 * s], [cx - 4 * s, cy + 56 * s]], tieColor);
    } else if (!coat) {
        poly([[cx - 8 * s, cy + 22 * s], [cx + 8 * s, cy + 22 * s], [cx, cy + 33 * s]],
             lighten(top, 0.55));
    }

    // body accessories
    if (job == "Doctor") {
        line(cx - 9 * s, cy + 24 * s, cx - 7 * s, cy + 46 * s, "#555555", 2 * s);
        line(cx + 9 * s, cy + 24 * s, cx + 7 * s, cy + 46 * s, "#555555", 2 * s);
        line(cx - 7 * s, cy + 46 * s, cx + 7 * s, cy + 46 * s, "#555555", 2 * s);
        circ(cx + 7 * s, cy + 50 * s, 3.5 * s, "#999999");
    }
    if (job == "Barista") {
        roundRect(cx - 14 * s, cy + 38 * s, 28 * s, 28 * s, 6 * s, "#7A5230");
        line(cx - 10 * s, cy + 24 * s, cx - 13 * s, cy + 40 * s, "#7A5230", 2 * s);
        line(cx + 10 * s, cy + 24 * s, cx + 13 * s, cy + 40 * s, "#7A5230", 2 * s);
    }
    if (job == "Retail Clerk") {
        roundRect(cx + 4 * s, cy + 34 * s, 12 * s, 7 * s, 2 * s, WHITE);
    }

    // head
    circ(cx, cy - 3 * s, 23 * s, hair);
    circ(cx - 19 * s, cy + 4 * s, 4.5 * s, skin);
    circ(cx + 19 * s, cy + 4 * s, 4.5 * s, skin);
    circ(cx, cy + 2 * s, 19 * s, skin);
    circ(cx - 10 * s, cy - 14 * s, 10 * s, hair);
    circ(cx + 5 * s, cy - 15 * s, 11 * s, hair);
    circ(cx + 14 * s, cy - 9 * s, 8 * s, hair);

    // glasses go under the eyes
    if (glasses) {
        var frame = (job == "Graphic Designer") ? PURPLE : "#333333";
        circ(cx - 7 * s, cy + 4 * s, 7.5 * s, frame);
        circ(cx + 7 * s, cy + 4 * s, 7.5 * s, frame);
        circ(cx - 7 * s, cy + 4 * s, 6 * s, skin);
        circ(cx + 7 * s, cy + 4 * s, 6 * s, skin);
        line(cx - 1 * s, cy + 4 * s, cx + 1 * s, cy + 4 * s, frame, 2 * s);
    }

    // eyes, cheeks and smile
    circ(cx - 7 * s, cy + 4 * s, 4.2 * s, WHITE);
    circ(cx + 7 * s, cy + 4 * s, 4.2 * s, WHITE);
    circ(cx - 6.5 * s, cy + 4.5 * s, 2.3 * s, "#2A2A2A");
    circ(cx + 7.5 * s, cy + 4.5 * s, 2.3 * s, "#2A2A2A");
    circ(cx - 13 * s, cy + 11 * s, 3.2 * s, "#F4A9A0");
    circ(cx + 13 * s, cy + 11 * s, 3.2 * s, "#F4A9A0");
    line(cx - 6 * s, cy + 11 * s, cx - 2.5 * s, cy + 14 * s, "#7A3E2E", 2 * s);
    line(cx - 2.5 * s, cy + 14 * s, cx + 2.5 * s, cy + 14 * s, "#7A3E2E", 2 * s);
    line(cx + 2.5 * s, cy + 14 * s, cx + 6 * s, cy + 11 * s, "#7A3E2E", 2 * s);

    // girl's bow
    if (girl) {
        poly([[cx + 12 * s, cy - 21 * s], [cx + 25 * s, cy - 28 * s], [cx + 25 * s, cy - 14 * s]], "#FF6FA5");
        poly([[cx + 12 * s, cy - 21 * s], [cx - 1 * s, cy - 28 * s], [cx - 1 * s, cy - 14 * s]], "#FF6FA5");
        circ(cx + 12 * s, cy - 21 * s, 3.5 * s, "#D6477F");
    }

    // hats and head accessories
    if (job == "Fast Food" || job == "Delivery Driver") {
        var capColor = (job == "Fast Food") ? RED : BLUE;
        circ(cx, cy - 12 * s, 17 * s, capColor);
        roundRect(cx - 20 * s, cy - 8 * s, 40 * s, 6 * s, 3 * s, darken(capColor, 0.25));
    }
    if (job == "Chef") {
        rect(cx - 15 * s, cy - 24 * s, 30 * s, 10 * s, WHITE);
        circ(cx - 10 * s, cy - 31 * s, 9 * s, WHITE);
        circ(cx, cy - 36 * s, 10 * s, WHITE);
        circ(cx + 10 * s, cy - 31 * s, 9 * s, WHITE);
        rect(cx - 15 * s, cy - 16 * s, 30 * s, 3 * s, "#D6DCE8");
    }
    if (job == "Painter") {
        circ(cx + 5 * s, cy - 22 * s, 15 * s, "#C0392B");
        circ(cx + 5 * s, cy - 37 * s, 2.5 * s, "#C0392B");
        rect(cx + 28 * s, cy + 30 * s, 3 * s, 32 * s, "#9B633D");
        rect(cx + 26.5 * s, cy + 23 * s, 6 * s, 8 * s, RED);
    }
    if (job == "Scientist") {
        rect(cx - 20 * s, cy - 14 * s, 40 * s, 5 * s, "#3B5BDB");
        circ(cx - 8 * s, cy - 11 * s, 6 * s, "#9DB4FF");
        circ(cx + 8 * s, cy - 11 * s, 6 * s, "#9DB4FF");
    }
    if (job == "Software Engineer") {
        line(cx - 21 * s, cy + 2 * s, cx - 20 * s, cy - 16 * s, "#2F2F2F", 3 * s);
        line(cx - 20 * s, cy - 16 * s, cx, cy - 27 * s, "#2F2F2F", 3 * s);
        line(cx, cy - 27 * s, cx + 20 * s, cy - 16 * s, "#2F2F2F", 3 * s);
        line(cx + 20 * s, cy - 16 * s, cx + 21 * s, cy + 2 * s, "#2F2F2F", 3 * s);
        roundRect(cx - 26 * s, cy - 2 * s, 9 * s, 14 * s, 4 * s, "#2F2F2F");
        roundRect(cx + 17 * s, cy - 2 * s, 9 * s, 14 * s, 4 * s, "#2F2F2F");
    }
    if (job == "Writer") {
        line(cx + 19 * s, cy - 2 * s, cx + 24 * s, cy - 18 * s, "#F2C14E", 3 * s);
        line(cx + 24 * s, cy - 18 * s, cx + 25 * s, cy - 22 * s, "#555555", 3 * s);
    }
    if (job == "Teacher") {
        roundRect(cx + 15 * s, cy + 50 * s, 18 * s, 14 * s, 3 * s, PURPLE);
        rect(cx + 17 * s, cy + 52 * s, 14 * s, 10 * s, "#EDE6F7");
    }
}


// ==========================================================
// SETUP SCREENS
// ==========================================================

function resetLifestyle() {
    selectedFood = "";
    foodCost = 0;
    foodLevel = 0;
    selectedHousing = "";
    housingCost = 0;
    housingLevel = 0;
    selectedTransport = "";
    transportCost = 0;
    transportLevel = 0;
}

function resetGame() {
    playerGender = "";
    selectedJob = "";
    selectedWage = 0;
    characterColor = "#4285D4";
    resetLifestyle();
    setupMode = true;
    month = 0;
    cash = START_CASH;
    savings = 0;
    stocks = 0;
    investGain = 0;
    eventReport = null;
    monthReport = null;
}

function totalExpenses() {
    return foodCost + housingCost + transportCost;
}

function netWorth() {
    return cash + savings + stocks;
}

// 10% to 100%, based on how well you live
function happiness() {
    return 10 + Math.round(foodLevel / 4 * 25 +
                           housingLevel / 4 * 35 +
                           transportLevel / 3 * 30);
}

// Happy workers earn bigger yearly raises
function raisePercent() {
    var h = happiness();
    if (h >= 60) { return 8; }
    if (h >= 30) { return 5; }
    return 2;
}

function getRating(amount) {
    if (amount >= 500000) { return "Financial Genius"; }
    if (amount >= 250000) { return "Money Master"; }
    if (amount >= 100000) { return "Smart Saver"; }
    return "Keep Learning";
}

// WELCOME SCREEN
function start() {
    resetScreen();
    drawScene(skyThemes[2]);

    // little boy and girl on the skyline
    var oldGender = playerGender;
    var oldColor = characterColor;
    playerGender = "Boy";
    characterColor = "#4285D4";
    drawCharacter(52, 292, 0.8);
    playerGender = "Girl";
    characterColor = "#E875A4";
    drawCharacter(348, 292, 0.8);
    playerGender = oldGender;
    characterColor = oldColor;

    // logo
    circ(200, 70, 40, "#B87F00");
    circ(200, 70, 36, GOLD);
    circ(200, 70, 28, "#FFD97A");
    addCenteredIn("$", 200, 84, 30, "#B87F00", true);

    addCenteredIn("CASH LIFE", 203, 156, 30, "#070B1F", true);
    addCenteredIn("CASH LIFE", 200, 153, 30, WHITE, true);
    addCenteredText("SIMULATOR", 180, 15, GOLD, true);
    addCenteredText("Pick a job. Make choices. See your future.", 206, 9, "#C9D4F2", false);

    addButton("START GAME", 100, 226, 200, 46, GREEN, function() {
        var name = prompt("What is your name?");
        if (name && name.length > 0) {
            playerName = name;
        }
        showGenderScreen();
    }, 13);
}

// CHARACTER SELECTION
function showGenderScreen() {
    clearScreen(BG);
    drawTopBar("CREATE YOUR CHARACTER");
    addCenteredText("Tap the character you want to play", 62, 10, MUTED, false);

    card(20, 76, 170, 280, "#D6E8FF");
    card(210, 76, 170, 280, "#FFDDEB");
    circ(105, 216, 66, "#EAF4FF");
    circ(295, 216, 66, "#FFEFF6");

    var oldJob = selectedJob;
    selectedJob = "";

    playerGender = "Boy";
    characterColor = "#4285D4";
    drawCharacter(105, 160, 1.5);

    playerGender = "Girl";
    characterColor = "#E875A4";
    drawCharacter(295, 160, 1.5);

    selectedJob = oldJob;
    playerGender = "";

    roundRect(55, 316, 100, 28, 14, BLUE);
    addCenteredIn("BOY", 105, 335, 12, WHITE, true);
    roundRect(245, 316, 100, 28, 14, "#E875A4");
    addCenteredIn("GIRL", 295, 335, 12, WHITE, true);

    buttons.push({
        x:20, y:76, w:170, h:280,
        action:function() {
            playerGender = "Boy";
            characterColor = "#4285D4";
            showJobScreen();
        }
    });

    buttons.push({
        x:210, y:76, w:170, h:280,
        action:function() {
            playerGender = "Girl";
            characterColor = "#E875A4";
            showJobScreen();
        }
    });
}

// CAREER SELECTION
function showJobScreen() {
    clearScreen(BG);
    drawTopBar("CHOOSE YOUR CAREER", "Higher pay = more choices", GOLD);

    for (var i = 0; i < jobs.length; i++) {

        var job = jobs[i];
        var col = i % 2;
        var row = Math.floor(i / 2);

        var x = 16 + col * 192;
        var y = 52 + row * 42;

        var tierColor = GRAYBLUE;
        if (job.wage >= 3000) { tierColor = GREEN; }
        if (job.wage >= 4500) { tierColor = BLUE; }
        if (job.wage >= 6000) { tierColor = PURPLE; }
        if (job.wage >= 7500) { tierColor = "#E0A100"; }

        card(x, y, 176, 36, WHITE);
        circ(x + 19, y + 18, 13, tierColor);
        addCenteredIn(job.icon, x + 19, y + 23, 11, WHITE, true);
        addText(job.name, x + 40, y + 16, 9, INK, true);
        addText(money(job.wage) + "/month", x + 40, y + 29, 8, GREEN, true);

        buttons.push({
            x:x, y:y, w:176, h:36,
            action:function(selected) {
                return function() {
                    selectedJob = selected.name;
                    selectedWage = selected.wage;
                    showJobConfirmation();
                };
            }(job)
        });
    }
}

// CAREER CONFIRMATION
function showJobConfirmation() {
    clearScreen(BG);
    drawTopBar("YOUR NEW LIFE");

    card(20, 52, 360, 230, WHITE);
    circ(100, 175, 70, lighten(characterColor, 0.82));
    drawCharacter(100, 118, 1.3);

    addText("NAME", 192, 84, 8, MUTED, true);
    addText(shortName(playerName), 192, 103, 14, INK, true);

    addText("CAREER", 192, 132, 8, MUTED, true);
    addText(selectedJob, 192, 151, 14, BLUE, true);

    addText("SALARY", 192, 180, 8, MUTED, true);
    addText(money(selectedWage) + "/month", 192, 200, 15, GREEN, true);

    addText("STARTING MONEY", 192, 230, 8, MUTED, true);
    addText(money(START_CASH), 192, 250, 14, INK, true);

    addButton("NEXT: CHOOSE HOW YOU LIVE", 40, 306, 320, 46, GREEN, function() {
        resetLifestyle();
        setupMode = true;
        showChoiceScreen("food");
    }, 11);
}


// ==========================================================
// FOOD / HOUSING / TRANSPORT CHOICES
// (one screen design is reused for all three)
// ==========================================================

function getOptions(kind) {
    if (kind == "food") { return foods; }
    if (kind == "housing") { return housing; }
    return transport;
}

function getTitle(kind) {
    if (kind == "food") { return "CHOOSE YOUR FOOD"; }
    if (kind == "housing") { return "CHOOSE YOUR HOME"; }
    return "CHOOSE YOUR TRANSPORT";
}

function getIconKind(kind) {
    if (kind == "food") { return "food"; }
    if (kind == "housing") { return "house"; }
    return "car";
}

function getKindColor(kind) {
    if (kind == "food") { return ORANGE; }
    if (kind == "housing") { return BLUE; }
    return PURPLE;
}

function getStepNumber(kind) {
    if (kind == "food") { return 1; }
    if (kind == "housing") { return 2; }
    return 3;
}

function getCurrentName(kind) {
    if (kind == "food") { return selectedFood; }
    if (kind == "housing") { return selectedHousing; }
    return selectedTransport;
}

// Total of the other two monthly costs
function otherCosts(kind) {
    var total = 0;
    if (kind != "food") { total += foodCost; }
    if (kind != "housing") { total += housingCost; }
    if (kind != "transport") { total += transportCost; }
    return total;
}

function applyChoice(kind, opt, level) {
    if (kind == "food") {
        selectedFood = opt.name;
        foodCost = opt.cost;
        foodLevel = level;
    } else if (kind == "housing") {
        selectedHousing = opt.name;
        housingCost = opt.cost;
        housingLevel = level;
    } else {
        selectedTransport = opt.name;
        transportCost = opt.cost;
        transportLevel = level;
    }
}

function makeChoiceAction(kind, opt, level) {
    return function() {
        applyChoice(kind, opt, level);

        if (setupMode) {
            if (kind == "food") {
                showChoiceScreen("housing");
            } else if (kind == "housing") {
                showChoiceScreen("transport");
            } else {
                showBudgetScreen();
            }
        } else {
            showLifestyleScreen();
        }
    };
}

function showChoiceScreen(kind) {
    clearScreen(BG);

    var options = getOptions(kind);
    var available = selectedWage - otherCosts(kind);
    var kindColor = getKindColor(kind);

    drawTopBar(getTitle(kind), "Budget left: " + money(available), GOLD);

    var top = 50;
    if (setupMode) {
        drawStepPills(["1  FOOD", "2  HOME", "3  RIDE"], getStepNumber(kind));
        top = 74;
    }

    for (var i = 0; i < options.length; i++) {

        var opt = options[i];
        var y = top + i * 54;
        var canAfford = (opt.cost <= available);
        var isCurrent = (!setupMode && opt.name == getCurrentName(kind));

        card(20, y, 360, 48, canAfford ? WHITE : "#E3E8F1");

        drawBadge(getIconKind(kind), 48, y + 24, 17, canAfford ? kindColor : "#B5BFD2");

        addText(opt.name, 76, y + 20, 11, canAfford ? INK : "#9AA6BE", true);
        addText(opt.desc, 76, y + 37, 8, canAfford ? MUTED : "#9AA6BE", false);

        if (isCurrent) {
            var nw = textWidth(opt.name, 11, true);
            roundRect(76 + nw + 8, y + 8, 52, 15, 7, GREEN);
            addCenteredIn("CURRENT", 76 + nw + 8 + 26, y + 19, 7, WHITE, true);
        }

        if (canAfford) {
            addRightText(money(opt.cost) + "/mo", 366, y + 29, 11, RED, true);

            buttons.push({
                x:20, y:y, w:360, h:48,
                action:makeChoiceAction(kind, opt, i)
            });
        } else {
            addRightText("Too expensive", 366, y + 29, 9, "#9AA6BE", true);
        }
    }

    if (!setupMode) {
        addButton("BACK", 130, 350, 140, 34, "#5B6FA8", function() {
            showLifestyleScreen();
        }, 10);
    }
}

// MONTHLY BUDGET (end of setup)
function showBudgetScreen() {
    clearScreen(BG);
    drawTopBar("YOUR MONTHLY BUDGET");

    var left = selectedWage - totalExpenses();

    card(20, 50, 360, 176, WHITE);
    addText("SALARY", 36, 74, 8, MUTED, true);
    addText(money(selectedWage) + " per month", 36, 94, 14, GREEN, true);

    // bar showing where the salary goes
    var bx = 36;
    var by = 106;
    var bw = 328;
    rect(bx - 2, by - 2, bw + 4, 24, "#DCE4F2");
    var segs = [{c:ORANGE, v:foodCost}, {c:BLUE, v:housingCost},
                {c:PURPLE, v:transportCost}, {c:GREEN, v:left}];
    var sx = bx;
    for (var i = 0; i < segs.length; i++) {
        var w = Math.round(bw * segs[i].v / selectedWage);
        if (i == segs.length - 1) { w = bx + bw - sx; }
        if (w > 0) { rect(sx, by, w, 20, segs[i].c); }
        sx += w;
    }

    var names = ["Food: " + selectedFood, "Home: " + selectedHousing,
                 "Ride: " + selectedTransport, "Left over each month"];
    var amounts = [-foodCost, -housingCost, -transportCost, left];
    for (var j = 0; j < 4; j++) {
        var ly = 150 + j * 20;
        rect(36, ly - 9, 10, 10, segs[j].c);
        addText(names[j], 54, ly, 10, INK, j == 3);
        addRightText(j == 3 ? money(left) : "-" + money(-amounts[j]), 364, ly, 10,
                     j == 3 ? GREEN : INK, true);
    }

    card(20, 238, 360, 72, WHITE);
    addText("HAPPINESS", 36, 260, 8, MUTED, true);
    var hp = happiness();
    var hpColor = (hp >= 60) ? GREEN : ((hp >= 30) ? ORANGE : RED);
    rect(34, 268, 182, 14, "#DCE4F2");
    rect(36, 270, Math.round(178 * hp / 100), 10, hpColor);
    addText(hp + "%", 224, 281, 11, hpColor, true);
    addText("Happier workers get bigger raises", 36, 298, 8, MUTED, false);

    drawCharacter(336, 256, 0.5);

    addButton("START YOUR NEW LIFE", 50, 324, 300, 42, GREEN, function() {
        startLife();
    }, 12);

    addButton("CHANGE CHOICES", 135, 372, 130, 24, "#5B6FA8", function() {
        resetLifestyle();
        setupMode = true;
        showChoiceScreen("food");
    }, 8);
}


// ==========================================================
// THE GAME: 3 SCREENS EVERY MONTH
// ==========================================================

function shuffledEvents() {
    var idx = [];
    var i;
    for (i = 0; i < events.length; i++) { idx.push(i); }
    for (i = idx.length - 1; i > 0; i--) {
        var k = Math.floor(Math.random() * (i + 1));
        var tmp = idx[i];
        idx[i] = idx[k];
        idx[k] = tmp;
    }
    return idx;
}

function startLife() {
    setupMode = false;
    month = 0;
    cash = START_CASH;
    savings = 0;
    stocks = 0;
    investGain = 0;
    eventOrder = shuffledEvents();
    beginMonth();
}

function beginMonth() {
    monthStartWorth = netWorth();
    currentEvent = events[eventOrder[month]];
    eventReport = null;
    showEventScreen();
}

// How much cash you need to pick this option
function neededCash(o) {
    return Math.max(0, -(o.cash || 0)) + (o.cost || 0) + Math.max(0, -(o.lose || 0));
}

function optionRight(o) {
    if (o.tag) { return o.tag; }
    if (o.savings) { return "+" + money(o.savings); }
    if (o.stocks) { return "+" + money(o.stocks); }
    var c = o.cash || 0;
    if (c > 0) { return "+" + money(c); }
    if (c < 0) { return "-" + money(-c); }
    return "$0";
}

function optionColor(o) {
    if (o.chance !== undefined) { return PURPLE; }
    if ((o.cash || 0) > 0 || o.savings || o.stocks) { return GREEN; }
    if ((o.cash || 0) < 0) { return ORANGE; }
    return BLUE;
}

// ---------- step 1: surprise ----------
function showEventScreen() {
    resetScreen();
    drawScene(skyThemes[month % 3]);
    drawMonthHeader(month + 1, 1);

    var ev = currentEvent;

    card(20, 98, 360, 262, WHITE);
    drawBadge(ev.icon, 200, 98, 26, ev.color);

    addCenteredText(ev.title, 148, 15, INK, true);
    addParagraph(ev.text, 200, 168, 10, MUTED, 320, 15, false);
    addCenteredText("What will you do?", 203, 9, INK, true);

    for (var i = 0; i < ev.options.length; i++) {
        var o = ev.options[i];
        var y = 211 + i * 47;
        var canAfford = (neededCash(o) <= cash);
        var color = canAfford ? optionColor(o) : "#C7D0E0";

        roundRect(32, y + 3, 336, 42, 10, darken(color, 0.3));
        roundRect(32, y, 336, 42, 10, color);

        addText(o.label, 46, y + 18, 10, canAfford ? WHITE : "#7C89A3", true);
        addText(o.sub, 46, y + 33, 8, canAfford ? lighten(color, 0.75) : "#8F9BB3", false);
        addRightText(canAfford ? optionRight(o) : "Can't afford", 354, y + 26, 11,
                     canAfford ? WHITE : "#7C89A3", true);

        if (canAfford) {
            buttons.push({
                x:32, y:y, w:336, h:42,
                action:function(opt) {
                    return function() { chooseEventOption(opt); };
                }(o)
            });
        }
    }
}

function chooseEventOption(o) {
    var before = netWorth();
    var label = o.label;

    cash -= (o.cost || 0);
    cash += (o.cash || 0);
    savings += (o.savings || 0);
    stocks += (o.stocks || 0);

    if (o.chance !== undefined) {
        if (Math.random() < o.chance) {
            cash += (o.win || 0);
            label += " (you won!)";
        } else {
            cash += (o.lose || 0);
            label += " (no luck)";
        }
    }

    eventReport = {label:label, delta:netWorth() - before};
    showInvestScreen();
}

// ---------- step 2: invest ----------
function investOptions() {
    var half = Math.floor(cash / 2 / 10) * 10;
    var quarter = Math.floor(cash / 4 / 10) * 10;
    var list = [];

    list.push({name:"Keep it as cash", desc:"Safe, but it earns nothing",
               icon:"coin", color:GRAYBLUE, toSavings:0, toStocks:0, sell:false,
               amount:0, ok:true});
    list.push({name:"Safe: savings account",
               desc:"Half your cash in savings (grows 0.3% a month)",
               icon:"bank", color:GREEN, toSavings:half, toStocks:0, sell:false,
               amount:half, ok:(half > 0)});
    list.push({name:"Risky: buy stocks",
               desc:"Half your cash in stocks (-6% to +8% a month)",
               icon:"chart", color:ORANGE, toSavings:0, toStocks:half, sell:false,
               amount:half, ok:(half > 0)});
    list.push({name:"Balanced: some of each",
               desc:"A quarter of your cash in savings and in stocks",
               icon:"chart", color:PURPLE, toSavings:quarter, toStocks:quarter, sell:false,
               amount:quarter * 2, ok:(quarter > 0)});
    if (savings + stocks > 0) {
        list.push({name:"Sell everything",
                   desc:"Turn all your investments back into cash",
                   icon:"coin", color:GRAYBLUE, toSavings:0, toStocks:0, sell:true,
                   amount:savings + stocks, ok:true});
    }
    return list;
}

function applyInvest(c) {
    if (c.sell) {
        cash += savings + stocks;
        savings = 0;
        stocks = 0;
    } else {
        cash -= c.toSavings + c.toStocks;
        savings += c.toSavings;
        stocks += c.toStocks;
    }
    playMonth();
    showResultsScreen();
}

function showInvestScreen() {
    clearScreen(BG);
    drawMonthHeader(month + 1, 2);

    drawChip(20, 72, 112, "CASH", money(cash), GREEN);
    drawChip(144, 72, 112, "SAVINGS", money(savings), ORANGE);
    drawChip(268, 72, 112, "STOCKS", money(stocks), BLUE);

    roundRect(20, 114, 360, 22, 8, "#FFF0C7");
    addCenteredText("Surprise: " + eventReport.label + "  (" +
                    signedMoney(eventReport.delta) + ")", 129, 9, INK, true);

    addText("What will you do with your cash?", 20, 156, 11, INK, true);

    var opts = investOptions();
    for (var i = 0; i < opts.length; i++) {
        var c = opts[i];
        var y = 164 + i * 45;
        var iconBg = c.ok ? c.color : "#B5BFD2";

        card(20, y, 360, 41, c.ok ? WHITE : "#E3E8F1");
        drawBadge(c.icon, 46, y + 20, 14, iconBg);
        addText(c.name, 70, y + 17, 10, c.ok ? INK : "#9AA6BE", true);
        addText(c.desc, 70, y + 31, 7, c.ok ? MUTED : "#9AA6BE", false);

        if (c.ok) {
            if (c.amount > 0) {
                addRightText(money(c.amount), 368, y + 26, 11, c.sell ? INK : GREEN, true);
            }
            buttons.push({
                x:20, y:y, w:360, h:41,
                action:function(choice) {
                    return function() { applyInvest(choice); };
                }(c)
            });
        }
    }
}

// ---------- the month happens ----------
function playMonth() {
    var rows = [];
    var bills = totalExpenses();

    rows.push({label:"Surprise: " + eventReport.label, amount:eventReport.delta});

    cash += selectedWage - bills;
    rows.push({label:"Paycheck", amount:selectedWage});
    rows.push({label:"Bills (food, home, transport)", amount:-bills});

    // Savings grow slowly and safely
    if (savings > 0) {
        var interest = Math.round(savings * 0.003);
        savings += interest;
        investGain += interest;
        rows.push({label:"Savings interest", amount:interest});
    }

    // Stocks go up or down: -6% to +8%
    if (stocks > 0) {
        var rate = (Math.random() * 14 - 6) / 100;
        var change = Math.round(stocks * rate);
        stocks += change;
        investGain += change;
        var pct = Math.round(Math.abs(rate) * 1000) / 10;
        rows.push({label:"Stocks went " + (change >= 0 ? "up " : "down ") + pct + "%",
                   amount:change});
    }

    month++;
    monthReport = {rows:rows, change:netWorth() - monthStartWorth};
}

// ---------- step 3: results ----------
function showResultsScreen() {
    clearScreen(BG);
    drawMonthHeader(month, 3);

    var rows = monthReport.rows;
    var dividerY = 130 + rows.length * 22 - 6;
    var cardBottom = dividerY + 54;

    card(20, 72, 360, cardBottom - 72, WHITE);
    roundRect(20, 72, 360, 32, 10, NAVY);
    rect(20, 88, 360, 16, NAVY);
    addText("MONTH " + month + " SUMMARY", 36, 93, 11, WHITE, true);
    drawIcon("coin", 358, 88, 0.9, NAVY);

    var y = 130;
    for (var i = 0; i < rows.length; i++) {
        var amt = rows[i].amount;
        addText(rows[i].label, 36, y, 10, INK, false);
        addRightText(signedMoney(amt), 364, y, 10, amt >= 0 ? GREEN : RED, true);
        y += 22;
    }

    rect(36, dividerY, 328, 2, "#DCE4F2");
    addText("Total money now", 36, dividerY + 26, 11, INK, true);
    addRightText(money(netWorth()), 364, dividerY + 28, 16, GREEN, true);
    addRightText("This month: " + signedMoney(monthReport.change), 364, dividerY + 44, 8,
                 monthReport.change >= 0 ? GREEN : RED, true);

    var label = (month >= MAX_MONTHS) ? "SEE MY 7-YEAR FORECAST"
                                      : "START MONTH " + (month + 1);
    addButton(label, 20, cardBottom + 14, 360, 42,
              (month >= MAX_MONTHS) ? PURPLE : GREEN, function() {
        if (month >= MAX_MONTHS) {
            showForecastScreen();
        } else {
            beginMonth();
        }
    }, 12);

    addButton("CHANGE LIFESTYLE", 120, cardBottom + 64, 160, 26, "#5B6FA8", function() {
        lifestyleBack = showResultsScreen;
        showLifestyleScreen();
    }, 8);
}


// ==========================================================
// CHANGE LIFESTYLE
// ==========================================================

function lifestyleRow(kind, y, name, cost) {
    card(20, y, 360, 52, WHITE);
    drawBadge(getIconKind(kind), 48, y + 26, 17, getKindColor(kind));
    addText(kind == "food" ? "FOOD" : (kind == "housing" ? "HOME" : "RIDE"),
            76, y + 19, 8, MUTED, true);
    addText(name, 76, y + 38, 11, INK, true);
    addRightText(money(cost) + "/mo", 262, y + 19, 9, RED, true);
    addButton("CHANGE", 276, y + 11, 90, 30, BLUE, function() {
        setupMode = false;
        showChoiceScreen(kind);
    }, 9);
}

function showLifestyleScreen() {
    clearScreen(BG);
    drawTopBar("YOUR LIFESTYLE");

    lifestyleRow("food", 50, selectedFood, foodCost);
    lifestyleRow("housing", 108, selectedHousing, housingCost);
    lifestyleRow("transport", 166, selectedTransport, transportCost);

    card(20, 226, 360, 82, WHITE);
    addText("LEFT OVER EACH MONTH", 36, 248, 8, MUTED, true);
    addText(money(selectedWage - totalExpenses()), 36, 270, 15, GREEN, true);
    var hp = happiness();
    var hpColor = (hp >= 60) ? GREEN : ((hp >= 30) ? ORANGE : RED);
    addText("HAPPINESS", 220, 248, 8, MUTED, true);
    rect(218, 256, 146, 12, "#DCE4F2");
    rect(220, 258, Math.round(142 * hp / 100), 8, hpColor);
    addText(hp + "%  = " + raisePercent() + "% yearly raise", 220, 286, 8, hpColor, true);
    addText("Happier workers get bigger raises", 36, 296, 8, MUTED, false);

    addButton("BACK", 110, 326, 180, 42, GREEN, function() {
        if (lifestyleBack) {
            lifestyleBack();
        } else {
            showResultsScreen();
        }
    }, 12);
}


// ==========================================================
// 7-YEAR FORECAST
// ==========================================================

// Money after each year for the next 7 years, using how your first
// months went:
//  - what is left after paying bills each month
//  - what your investments earned each month
//  - a yearly raise (bigger if you are happier)
// One-time surprises (like a broken laptop) are not repeated.
function forecastSeries() {
    var investPerMonth = investGain / month;
    var raise = raisePercent();
    var wage = selectedWage;
    var total = netWorth();
    var points = [total];

    for (var m = month + 1; m <= FORECAST_MONTHS; m++) {
        // raise at the start of year 2, 3, 4...
        if (m > 12 && (m - 1) % 12 == 0) {
            wage = wage * (1 + raise / 100);
        }
        total += wage - totalExpenses() + investPerMonth;
        if (m % 12 == 0) { points.push(total); }
    }
    return points;
}

function forecastMoney() {
    var p = forecastSeries();
    return Math.round(p[p.length - 1]);
}

function showForecastScreen() {
    resetScreen();
    drawSky(skyThemes[2]);

    var perMonthInvest = Math.round(investGain / month);
    var points = forecastSeries();
    var forecast = Math.round(points[points.length - 1]);

    addCenteredText(FORECAST_YEARS + " YEARS FROM NOW", 28, 15, WHITE, true);
    addCenteredText("Based on how you did in your first " + month + " months",
                    44, 8, "#C9D4F2", false);
    addCenteredText("You could have", 70, 10, "#C9D4F2", false);
    addCenteredIn(money(forecast), 202, 108, 30, "#070B1F", true);
    addCenteredText(money(forecast), 106, 30, GOLD, true);

    var rating = getRating(forecast);
    var rw = textWidth(rating, 9, true) + 28;
    roundRect(200 - rw / 2, 118, rw, 22, 11, GOLD);
    addCenteredText(rating, 133, 9, NAVY, true);

    // chart
    card(20, 150, 360, 140, WHITE);
    addText("Your money over " + FORECAST_YEARS + " years", 34, 168, 9, INK, true);

    var cx0 = 52;
    var cx1 = 358;
    var yTop = 186;
    var yBottom = 262;
    var maxV = 1;
    var i;
    for (i = 0; i < points.length; i++) {
        if (points[i] > maxV) { maxV = points[i]; }
    }
    for (i = 1; i <= 3; i++) {
        rect(cx0 - 10, yBottom - (yBottom - yTop) * i / 3, cx1 - cx0 + 20, 1, "#E3EAF6");
    }
    rect(cx0 - 10, yBottom, cx1 - cx0 + 20, 2, "#B8C6DD");

    var px = [];
    var py = [];
    for (i = 0; i < points.length; i++) {
        var v = Math.max(0, points[i]);
        px.push(cx0 + (cx1 - cx0) * i / (points.length - 1));
        py.push(yBottom - (yBottom - yTop) * v / maxV);
    }
    for (i = 0; i < points.length; i++) {
        rect(px[i] - 7, py[i], 14, yBottom - py[i], lighten(GREEN, 0.72));
    }
    for (i = 0; i < points.length - 1; i++) {
        line(px[i], py[i], px[i + 1], py[i + 1], GREEN, 3);
    }
    for (i = 0; i < points.length; i++) {
        circ(px[i], py[i], 4.5, WHITE);
        circ(px[i], py[i], 3, GREEN);
        addCenteredIn(i == 0 ? "Now" : "Y" + i, px[i], yBottom + 15, 7, MUTED, true);
    }
    addRightText(compact(forecast), 372, py[points.length - 1] - 8, 8, GREEN, true);

    // what the forecast is built from
    var invColor = perMonthInvest >= 0 ? GREEN : RED;
    drawChip(20, 298, 112, "LEFT AFTER BILLS", signedMoney(selectedWage - totalExpenses()) + "/mo", GREEN);
    drawChip(144, 298, 112, "FROM INVESTING", signedMoney(perMonthInvest) + "/mo", invColor);
    drawChip(268, 298, 112, "YEARLY RAISE", "+" + raisePercent() + "% a year", BLUE);

    addButton("PLAY AGAIN", 100, 346, 200, 42, GREEN, function() {
        resetGame();
        start();
    }, 12);
}


// ==========================================================
// MOUSE CLICK HANDLER
// ==========================================================
function handleClick(e) {
    var x = e.getX();
    var y = e.getY();

    for (var i = buttons.length - 1; i >= 0; i--) {
        var b = buttons[i];

        if (x >= b.x && x <= b.x + b.w &&
            y >= b.y && y <= b.y + b.h) {

            b.action();
            return;
        }
    }
}

mouseClickMethod(handleClick);
start();