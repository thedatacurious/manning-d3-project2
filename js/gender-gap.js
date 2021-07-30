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

  console.log(bins)

  //Generate scales

  const yScale = d3.scaleLinear()
  .domain([0,dataset.earnings_USD_2019])
  .range([dimensions.boundedHeight,0])

  const xScale = d3.scaleLinear()
  .domain([0, d3.max(bins.map(d => d.bins.map(datum => datum.length)).flat())])
  .range([0,60])

  console.log(bins.map(d => d.bins.map(datum => datum.length)).flat())

  // Generate axes

  const yAxisGenerator = d3.axisLeft().scale(yScale)

distChart.append('line')
  .attr('x1',0)
  .attr('y1',dimensions.boundedHeight)
  .attr('x2',dimensions.boundedWidth)
  .attr('y2',dimensions.boundedHeight)
  .attr('stroke', 'black')
  .attr('stroke-width',1)

};

createViz();
