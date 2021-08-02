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
        bins: d3.bin().thresholds(5)(dataset.filter(d => d.sport == sport && d.gender == gender).map(d => d.earnings_USD_2019)) // bin the earnings for a given sport-gender combination
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

  // console.log(bins)

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

    function drawMapElements(value, key, map) {
      distChart.append('g')
      .append('path')
      .attr('d', menAreaGenerator(sportGenderBins.get(key).get('men')[0].bins))
      .style("fill", colorMen)
      .style('stroke', 'none')
      .style('transform', `translate(${xScale(key)}px,0px)`)

      distChart.append('g')
      .append('path')
      .attr('d', womenAreaGenerator(sportGenderBins.get(key).get('women')[0].bins))
      .style("fill", colorWomen)
      .style('stroke', 'none')
      .style('transform', `translate(${xScale(key)}px,0px)`)
}

    sportGenderBins.forEach(drawMapElements)


  };






createViz();
