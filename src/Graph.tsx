import React, { Component } from 'react';
import { Table } from '@jpmorganchase/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    //modified the schema object so that we can configure the Perspective
    //table view of our graph in a way that allows us to [cont...]
    const schema = {
      //***calculate the ratios,***
      price_abc: 'float',
      price_def: 'float',
      //***track the ratios,***
      ratio: 'float',
      timestamp: 'date',
      //***track the upper and lower bounds, and...***
      upper_bound: 'float',
      lower_bound: 'float',
      //***alert traders of when these bounds are crossed.***
      trigger_alert: 'float',
    };
    //We removed the fields that tracked the two stocks independently, 
    //because we no onger need to distinguish between the two.

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      // removed the column-pivots attribute because our graph no longer
      // needs to distinguish between the two stocks.
      // changed columns attribute to plot the 4 datapoint values needed.
      // changed aggregates attribute to average the duplicate datapoints 
      // of the data fields we established in the above schema, considering
      // data points to be unique only when they have unique timestamps. 
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  // the value of the Row object imported from DataManipulators has been
  // changed from an array to a single object. As such, we are changing
  // the data-structe of the argument passed to table.update into an array,
  // to store the incoming objects as a list of objects.
  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ]);
    }
  }
}

export default Graph;
