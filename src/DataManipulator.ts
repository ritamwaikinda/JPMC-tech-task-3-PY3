import { ServerRespond } from './DataStreamer';

//modified row interface to match the structure of the schema from ./Graph.tsx, so 
//that the object returned by the generateRow function can pass it the correct data.
export interface Row {
 price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}


export class DataManipulator {
  // took Row values out of an array, and changed value to a single Row object.
  static generateRow(serverRespond: ServerRespond[]): Row {
    //calculated price of stock ABC and stock DEF.
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;
    const ratio = priceABC / priceDEF;
    //established upper and lower bounds to +/-10% historical 12-month average ratio.
    const upperBound = 1 + 0.1;
    const lowerBound = 1 - 0.01;
      return {
        price_abc: priceABC,
        price_def: priceDEF,
        ratio,
        timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ? serverRespond[0].timestamp : serverRespond[1].timestamp,
        upper_bound: upperBound,
        lower_bound: lowerBound,
        trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
        //if ratio does not pass threshold, no value is needed.
      };
  }
}
