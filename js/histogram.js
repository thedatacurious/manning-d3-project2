// const margin = {top: 30, right: 20, bottom: 50, left: 60};
// const width = 1200;
// const height = 600;
const padding = 1;
const color = 'steelblue';

d3.csv("./../data/pay_by_gender_tennis.csv").then(
  d => createHistogram(d)
)

function createHistogram(data){
    const earnings = data.map(d => +d.earnings_USD_2019.replace(',','').replace(',',''))
    const earningsBinned = d3.bin()(earnings)
    console.log(earningsBinned)

    // Add chart dimensions

    let dimensions = {
        width:  1200,
        height: 600,
        margin: {
          top: 30,
          right: 30,
          bottom: 50,
          left: 60,
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

    const histoChart = wrapper.append('g')
    .style('transform',`translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`)


// Add scales
    const xScale = d3.scaleLinear()
    .domain([0,d3.max(earnings)])
    .range([0,dimensions.boundedWidth])
    .nice()

  //   let binSize = []
  //   earningsBinned.forEach(function(item){
  //     binSize.push(item.length)
  //   }
  // )

    const yScale = d3.scaleLinear()
    .domain([0, d3.max(earningsBinned.map(d => d.length))])
    .range([dimensions.boundedHeight,0])

    // Draw histogram

    histoChart.selectAll('rect')
    .data(earningsBinned)
    .join('rect')
    .attr('x', d =>  xScale(d.x0))
    .attr('y', d => yScale(d.length))
    .attr('width', d => xScale(d.x1)-xScale(d.x0))
    .attr('height', d => dimensions.boundedHeight - yScale(d.length))
    .style('fill', 'cornflowerblue')

  // Generate axes

  const xAxisGenerator = d3.axisBottom().scale(xScale)

  const xAxis = histoChart.append('g')
  .call(xAxisGenerator)
  .style('transform', `translateY(${dimensions.boundedHeight}px)`)

  xAxis.append("text")
  .style("fill", "black")
  .attr("x",dimensions.boundedWidth)
  .attr("y", dimensions.margin.bottom*0.8)
  .text("Earnings in 2019 (USD)")
  .style("text-anchor", "end")


  const yAxisGenerator = d3.axisLeft().scale(yScale)

  const yAxis = histoChart.append('g')
  .call(yAxisGenerator)

 // Line and area generators

  const lineGenerator = d3.line()
    .x(d => d3.median([xScale(d.x1),xScale(d.x0)]))
    .y(d => yScale(d.length))
    .curve(d3.curveCatmullRom)

  const areaGenerator = d3.area()
  .x(d => d3.median([xScale(d.x1),xScale(d.x0)]))
  .y0(yScale(0))
  .y1(d => yScale(d.length))
  .curve(d3.curveCatmullRom)

  histoChart.append('path')
  .attr('d', lineGenerator(earningsBinned))
  .attr('fill', 'none')
  .attr('stroke', '#cce5df')
  .attr('stroke-width', 1)

  histoChart.append('path')
  .attr('d', areaGenerator(earningsBinned))
  .attr("fill", "#cce5df88")

}
