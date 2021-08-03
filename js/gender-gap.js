// const margin = {top: 30, right: 20, bottom: 50, left: 60};
// const width = 1200;
// const height = 600;
const colorMen = '#F2C53D';
const colorWomen = '#A6BF4B';
const colorMenCircles = '#BF9B30';
const colorWomenCircles = '#718233';

async function createViz(){

  // Add chart dimensions

  let dimensions = {
      width:  1200,
      height: 600,
      margin: {
        top: 60,
        right: 30,
        bottom: 50,
        left: 90,
      },
    }

    dimensions.boundedWidth = dimensions.width
      - dimensions.margin.left
      - dimensions.margin.right
    dimensions.boundedHeight = dimensions.height
      - dimensions.margin.top
      - dimensions.margin.bottom

  const wrapper = d3.select('#viz')
  .append('svg')
  .attr('width', dimensions.width)
  .attr('height', dimensions.height)

  const distChart = wrapper.append('g')
  .style('transform',`translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`)

// Load data here
 const dataset = await d3.csv('./data/pay_by_gender_all.csv')

dataset.forEach(datum => {
    datum['earnings_USD_2019'] = +datum['earnings_USD_2019'].replace(",","").replace(",","")
  });


// Create bins for each sport, men and women

  const sports = [ 'basketball', 'golf', 'tennis'];
  const genders = ['men', 'women'];
  const bins = [];

  sports.forEach(sport => {
    genders.forEach(gender => {

      const binsSet = {
        sport: sport,
        gender: gender,
        bins: d3.bin()(dataset.filter(d => d.sport == sport && d.gender == gender).map(d => d.earnings_USD_2019)) // bin the earnings for a given sport-gender combination
      };
      bins.push(binsSet);
    });
  });

  // for (let index = 0; index < sports.length; index++){
  //   for (let indexj = 0; indexj < genders.length; indexj++){
  //     const binsSet = await {
  //       sport: sports[index],
  //       gender: genders[indexj],
  //       bins: d3.bin().thresholds(5)(dataset.filter(d => d.sport == sports[index] && d.gender == genders[indexj]).map(d => d.earnings_USD_2019)) // bin the earnings for a given sport-gender combination
  //     };
  //     bins.push(binsSet);
  //   }
  // }

  const sportGenderBins = d3.group(bins, d => d.sport, d => d.gender)


  //Generate scales


  const binSizes = bins.map(d => d.bins.map(datum => datum.length)).flat()

  const earnings = dataset.map(d=> d.earnings_USD_2019)

  const yScale = d3.scaleLinear()
  .domain([0,d3.max(earnings)])
  .range([dimensions.boundedHeight,0])
  .nice()

  const xScale = d3.scaleBand()
  .range([ 0, dimensions.boundedWidth])
  .domain(["basketball", "golf", "tennis"])
  .padding(0.05)

  const xNum = d3.scaleLinear()
  .domain([-d3.max(binSizes), d3.max(binSizes)])
  .range([0,xScale.bandwidth()])


  // console.log(bins.map(d => d.bins.map(datum => datum.length)).flat())

  // Generate axes

  const yAxisGenerator = d3.axisLeft().scale(yScale)

  const yAxis = distChart.append('g')
  .call(yAxisGenerator)
  .attr("class", "axis")

  yAxis.append("text")
  .style("fill", "black")
  .attr("x", -dimensions.margin.left)
  .attr("y", -dimensions.margin.top/2)
  .text("Earnings in 2019 (USD)")
  .style("text-anchor", "start")
  .style("font-size", "1.2rem")

  const xAxisGenerator = d3.axisBottom().scale(xScale)

  const xAxis = distChart.append('g')
  .call(xAxisGenerator)
  .style('transform', `translate(${0}px, ${dimensions.boundedHeight}px)`)
  .style("font-size", ".8rem")

  // append('line')
  //   .attr('x1',0)
  //   .attr('y1',dimensions.boundedHeight)
  //   .attr('x2',dimensions.boundedWidth)
  //   .attr('y2',dimensions.boundedHeight)
  //   .attr('stroke', 'black')
  //   .attr('stroke-width',1)
  //   .attr('shape-rendering','crispEdges')
  //   .style("transform",`translateX(8px)`)

    // Create area generators

    const menAreaGenerator = d3.area()
    .x0(xNum(0))
    .x1(d=> xNum(d.length))
    .y(d => yScale(d.x0))
    .curve(d3.curveCatmullRom)

    const womenAreaGenerator = d3.area()
    .x0(d => xNum(-d.length))
    .x1(xNum(0))
    .y(d => yScale(d.x0))
    .curve(d3.curveCatmullRom)

//// Alternate charting method
    // distChart
    // .append('g')
    //   .attr('class', 'violins')
    // .selectAll('.violin')
    // .data(bins)
    // .join('path')
    //   .attr('class', d => `violin violin-${d.sport} violin-${d.gender}`)
    //   .attr('d', d => d.gender === 'women' ? womenAreaGenerator(d.bins) : menAreaGenerator(d.bins))
    //   .attr('transform', d => {
    //     return `translate(${xScale(d.sport)}, 0)`; // The margin.left part of the translation is applied in the areaGenerator functions to avoid negative x values for women
    //   })
    //   .attr('fill', d => d.gender === 'women' ? colorWomen : colorMen)
    //   .attr('fill-opacity', 0.8)
    //   .attr('stroke', 'none');
//
    function drawMapElements(value, key, map) {
      distChart.append('g')
      .append('path')
      .attr('d', menAreaGenerator(sportGenderBins.get(key).get('men')[0].bins))
      .style("fill", colorMen+'88')
      .style('stroke', 'none')
      .style('transform', `translate(${xScale(key)}px,0px)`)

      distChart.append('g')
      .append('path')
      .attr('d', womenAreaGenerator(sportGenderBins.get(key).get('women')[0].bins))
      .style("fill", colorWomen+'88')
      .style('stroke', 'none')
      .style('transform', `translate(${xScale(key)}px,0px)`)
}

    sportGenderBins.forEach(drawMapElements)

    // Draw individual colorMenCircles
    const circleRadius = 2.5;
    const circlesPadding = 0.7;


    // const tennisDataMen = dataset.filter(d => d.sport == 'tennis' && d.gender == 'men')
    // console.log(tennisDataMen)

  //   const simulation = d3.forceSimulation(dataset)
  //   .force('x', d3.forceX( d =>
  //     { if(d.gender == 'men'){
  //       return (d.x < xNum(0) ? xNum(1.5): xNum(0))
  //     }
  //       else {
  //       return (d.x > xNum(-1) ? xNum(-10): xNum(-1))
  //       }
  //     }
  //   ).strength(0.1)
  // )

    const simulation = d3.forceSimulation(dataset)
    .force('x', d3.forceX(d => xNum(0)).strength(0.1))
    .force('y', d3.forceY(d => yScale(d.earnings_USD_2019)).strength(10))
    .force('collide', d3.forceCollide().strength(0.2).radius(circleRadius + circlesPadding))
    .force('axis', () => {
    dataset.forEach(datum => {
       if (datum.gender == 'men' && datum.x < xNum(0)) {
          datum.vx += 0.01 * datum.x;
       }
       if (datum.gender == 'women' && datum.x > xNum(0)) {
          datum.vx -= 0.15 * datum.x;
       }
       if (Math.abs(datum.y-yScale(0)) < 0.005*datum.y) {
          datum.vy -= 0.0005 * datum.y;
       }
    });
 })
    .stop();

    console.log(Math.abs(yScale(53616)-yScale(0))/yScale(53616))


    const numIterations = 300;
    for (let i = 0; i < numIterations; i++)
    {simulation.tick();
  }

    simulation.stop();
    console.log(dataset)


    distChart.append('g')
    .selectAll('.circles')
    .data(dataset)
    .join('circle')
    .attr('class', d => `circles-${d.gender}-${d.sport}`)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', circleRadius)
    .attr('fill', d => d.gender === 'women' ? colorWomen : colorMen)
    .style('transform', d => `translate(${xScale(d.sport)}px,0px)`)

};


createViz();
