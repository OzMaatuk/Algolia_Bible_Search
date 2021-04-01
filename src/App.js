import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ChatBot, { Loading } from 'react-simple-chatbot';
const algoliasearch = require('algoliasearch');
const client = algoliasearch('BQN9TMR0AU', 'c85c12c676855d2d6d62cf3b3df4cafe');
const index = client.initIndex('test_929');

class DBPedia extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      result: '',
      trigger: false,
      hits: '',
    };

    this.triggetNext = this.triggetNext.bind(this);
  }
  /*
          let ans = 'found nothing';
        //if (hits[0].length === 0) throw new Error();
        for (const i of hits[0]._highlightResult) {
          if (i.text.matchedWords)
            if (i.text.matchedWords.length > 0) {
              ans = i.text.value;
              break;
            }
        }
  */
  //  result: hits[0].phrases[0].text,
  componentWillMount() {
    const self = this;
    const { steps } = this.props;
    const searchQuery = steps.search.value;

    index
      .search(searchQuery)
      .then(({ hits }) => {
        self.setState({
          loading: false,
          result: hits[0].text,
        });
      })
      .catch(() => {
        self.setState({ loading: false, result: 'Not found.' });
      });
  }

  triggetNext() {
    this.setState({ trigger: true }, () => {
      this.props.triggerNextStep();
    });
  }

  render() {
    const { trigger, loading, result } = this.state;

    return (
      <div className="dbpedia">
        {loading ? <Loading /> : result}
        {!loading && (
          <div
            style={{
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            {!trigger && (
              <button onClick={() => this.triggetNext()}>Search Again</button>
            )}
          </div>
        )}
      </div>
    );
  }
}

DBPedia.propTypes = {
  steps: PropTypes.object,
  triggerNextStep: PropTypes.func,
};

DBPedia.defaultProps = {
  steps: undefined,
  triggerNextStep: undefined,
};

const ExampleDBPedia = () => (
  <ChatBot
    steps={[
      {
        id: '1',
        message: 'Type something to search on Wikipédia. (Ex.: Brazil)',
        trigger: 'search',
      },
      {
        id: 'search',
        user: true,
        trigger: '3',
      },
      {
        id: '3',
        component: <DBPedia />,
        waitAction: true,
        trigger: '1',
      },
    ]}
  />
);

export default ExampleDBPedia;
