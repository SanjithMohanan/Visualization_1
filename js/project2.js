$(document).ready(function () {
var margin = {top: 20, right: 20, bottom: 30, left: 40},
	padding = -90,
    width = 1200,
    height = 400;
/*var x = d3.scale.linear()
    .range([0, width]);*/
//Declaring the type of x axis value and its dimensions
    var x = d3.time.scale()
    .range([0, width - 200]);
	
//Declaring the type of y axis value and its dimesions
var y = d3.scale.linear()
    .range([height, 0]);
	
//Declaring predefined array of colors
var color = d3.scale.category10();

//Defining x axis
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

//Defining y axis
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
	
//defining variable for ploting the lines between points	
	var valueline = d3.svg.line()
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.y); })
    .interpolate("linear");

	// Define the div for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);


//varible for parsing string date to actual date format
    var parseDate = d3.time.format("%Y-%m-%d");
	
	var formatTime = d3.time.format("%e %B");

//Defining the canvas for drawing the scatterplot	
var svg = d3.select("#timeSeriesChart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Loading the data from the json file.
d3.json("exchange2017.json", function(error, data) {
  if (error) throw error;

//Storing the read values in internal data structure
var datatorender=[];
data.observations.forEach(function (d){
for(var k in d){
//console.log("K : " + k);
	
if(k!="d" && d[k].v){
//	console.log("d[k].v" + d[k].v);
var node = {
"date":parseDate.parse(d.d), //storing date
"category":k, //storing category
"yVal": d[k].v //storing exchange rate value
}
datatorender.push(node);
}
}
});

//Storing value accrding to the category of data
var lineValue = []; //2D array for storing the date and yVal for each category.
for(var i=0;i<=5;i++)
{
	//console.log("inside for loop : i= " + i );
	lineValue[i]=new Array();
}
var i = 0;
datatorender.forEach(function(d){
	
	if(d.category == "FXEURCAD")
		i=0;
		else if(d.category == "FXAUDCAD")
			i=1;
		else if(d.category == "FXBRLCAD")
			i=2;
		else if(d.category == "FXHKDCAD")
			i=3;
		else if(d.category == "FXGBPCAD")
			i=4;
		else if(d.category == "FXUSDCAD")
			i=5;
		//console.log(d.date);
	var node1 = {
		"x":d.date,
		"y":d.yVal,
		"category":d.category
		}
		lineValue[i].push(node1);
	});

//Defining x axis
 x.domain([d3.min(datatorender, function(d) { return d.date; }),d3.max(datatorender, function(d) { return d.date; })]);
 // x.domain(d3.extent(datatorender, function(d) { return d.date; })).nice();
//Defining y axis 
 y.domain(d3.extent(datatorender, function(d) { return d.yVal; })).nice();
 
//Drawing x axis on the canvas	
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width/2 - 200)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("months of year 2017");
	 

	  
//Drawing y axis on the canvas	  
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "translate("+ (padding/2) +","+(height/2)+")rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("exchange rate");

	//Function for ploting lines between data points
	function drawLine(alteredLineValue){	
		alteredLineValue.forEach(function(d){
		svg.append('g')
		.data([d])
		.attr("id",function([d]) { 
		return d.category;})
		.attr('class', 'datapath')
		.selectAll('path')
		.data([d])
		//.data([datatorender])
		.enter().append('path')
        .attr("d", valueline)
		.style("stroke-width", 1)
		.style("stroke", function([d]) { 
		return color(d.category);})//"rgb(6,120,155)")
		.style("fill", "none");
	
}) }
	
//Ploting lines between data points
drawLine(lineValue);

//Ploting the data points in the graph
function plotDataPoints(){
  svg.selectAll(".dot")
      .data(datatorender)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 2.5) //specifying the radius of the circle/data point
      .attr("cx", function(d) {
       return x(d.date); })
      .attr("cy", function(d) {
       return y(d.yVal); })
	  .style("opacity", 1)
	  .style("stroke", "none")
      .style("fill", function(d) { 
		return color(d.category);}) //giving color to the datapoints depending on the catagory
		.append("svg:title")
		//shows date and exchange rate when mouse is placed on the dots 
		.text(function(d) {
			return ("(" + d.date + " , " + d.yVal + ")");})
	
}	

//Ploting data points
plotDataPoints();
	
d3.selectAll("#resetbutton").on("click",function(){	
		console.log("inside button click");
		d3.selectAll(".dot").remove(); //hiding the available dots.
			svg.selectAll(".datapath").remove();
			 x.domain([d3.min(datatorender, function(d) { return d.date; }),d3.max(datatorender, function(d) { return d.date; })]);
			xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");
			svg.select('.x.axis')
			.attr('transform', 'translate(0,' + height + ')')
			.call(xAxis);
			plotDataPoints();
			drawLine(lineValue);
			clickOnDots();
			clickOnTicks();
	
		 });
		
//Code for scale change
function clickOnTicks(){
	svg.select(".x.axis")
	.selectAll(".tick")
	
		.on("click", function(type) {
		var maxDate = 	new Date();
		
		 maxDate.setDate(1);
		maxDate.setMonth(type.getMonth()+1);

	d3.selectAll(".dot").remove(); //hiding the available dots.
	x.domain([type,maxDate]);
	//x.domain([minDate,type]);

	xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom").ticks(d3.time.date, 1);
	svg.select('.x.axis')
			.attr('transform', 'translate(0,' + height + ')')
			.call(xAxis);
	
	
	svg.selectAll(".dot")
      .data(datatorender)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 2.5) //specifying the radius of the circle/data point
	  .filter(function(d){
		
			return d["date"]>= type && d["date"] <= maxDate;
			})     
	 .attr("cx", function(d) {
       return x(d.date); })
      .attr("cy", function(d) {
       return y(d.yVal); })
	  .style("opacity", 1)
	  .style("stroke", "none")
      .style("fill", function(d) { 
		return color(d.category);}) //giving color to the datapoints depending on the catagory
		.append("svg:title")
		//shows date and exchange rate when mouse is placed on the dots 
		.text(function(d) {
			return ("(" + d.date + " , " + d.yVal + ")");})
		
		clickOnDots();
	//Removing all the plotted lines
		svg.selectAll(".datapath").remove();
			
	
var alteredLineValue = []; //2D array for storing the date and yVal for each category.
for(var i=0;i<=5;i++)
{
	alteredLineValue[i]=new Array();
}
for(i=0;i<6;i++){
	lineValue[i].forEach(function(d){
		if(d.x >= type && d.x <= maxDate ){
		alteredLineValue[i].push(d);
	}

}) }

//Code for ploting lines between data points
drawLine(alteredLineValue);

})
}

clickOnTicks();
								
		
//Creating the legends.		
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
//Defining the dimension of the legends 
  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) {
		return data.seriesDetail[d].label; //Giving value to each legend
       });
	   

//Providing mouseover event to the legends.
  legend.on("mouseover", function(type) {
        // dim all of the icons in legend
        d3.selectAll(".legend")
            .style("opacity", 0.1); //Reducing opacity of all the legends
        // make the one selected be un-dimmed
        d3.select(this)
            .style("opacity", 1); //Providing high opacity to selected legend
			
		d3.select('h3')
			.style("visibility","visible") //Providing scatterplot details
			.text(data.seriesDetail[type].description);
			 
        // select all dots and apply 0 opacity (hide)
        d3.selectAll(".dot")
        // .transition()
        // .duration(500)
        .style("opacity", 0.3)
        // filter out the ones we want to show and apply properties
        .filter(function(d) {
		//	console.log(d["category"] + "   " + type);
            return d["category"] == type;
        })
            .style("opacity", 1) // need this line to unhide dots
        .style("stroke", "black")
        // apply stroke rule
        .style("fill", function(d) {
                return this;

        });
		d3.selectAll(".datapath") //a111111111
			.style("opacity",0)
		d3.selectAll("#" + type)
			.style("opacity",1)
			
		
    })
	.on("mouseout",function(){ //On mouseout everything will be set back to normal
		d3.selectAll(".legend")
            .style("opacity", 1);
		 d3.selectAll(".dot")
			.style("opacity", 1)
			.style("stroke", "none");
		d3.select('h3')
			.style("visibility","hidden");
		d3.selectAll(".datapath")  //a111111111
			.style("opacity",1)
	});
	
	function clickOnDots(){
	svg.selectAll(".dot") //Providing mouse over event on all the data points.
	.on("mouseover",function(d){
		//console.log(d["category"]);
		 d3.selectAll(".dot")
        .style("opacity", 0) //removing the visibility of all data points.
        // filter out the ones we want to show and apply properties
        .filter(function(e) {
            return d["category"] == e["category"];
        })
            .style("opacity", 1) // need this line to unhide dots
		d3.selectAll(".datapath") //1111111111111
			.style("opacity",0)
		d3.selectAll("#" + d["category"])
			.style("opacity",1)
		d3.select(this).style("stroke","Red")//highlighting only the selected data point.
		
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div	.html(formatTime(d.date) + "<br/>"  + d.yVal)	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
      	
		
		})
	
	.on("mouseout",function(){ //On mouseout everything will be set back to normal
		 d3.selectAll(".dot")
			.style("opacity", 1)
		d3.selectAll(".datapath") //1111111111111
			.style("opacity",1)
		d3.select(this).style("stroke","none")
		 div.transition()		
                .duration(500)		
                .style("opacity", 0);	
	}) }
	
	clickOnDots();//Providing click event functionality on data points
	clickOnTicks();//Providing click event functionality on x-axis ticks
	});
	
});