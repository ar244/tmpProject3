// Include React
var React = require("react");

// Helper for making AJAX requests to our API
var helpers = require("./utils/helpers");


//library to convert mongoDB date isoDate format
var moment = require("moment");

var Story = React.createClass({

  getInitialState: function() {
    return {
      hearts: 0,
      flags: 0
    };
  },

  handleHeartClick: function(event) {
    var i = event.target.value;
    var hearts = parseInt(this.props.story[i].hearts) + 1;

     //this.setState({ hearts: this.state.hearts + 1 });
    console.log("in handleHeartClick ", this.props.story[i]._id, " ", hearts);
    helpers.updateHearts(this.props.story[i]._id, hearts).then(function () {
      console.log("Posted to MongoDB");
    });

  },

  handleFlagClick: function(event) {
    //this.setState({ flags: this.state.flags + 1 });
  },

  render: function() {

    return (
      
    <div className="row">
      {this.props.story.map((card, i) => {
        
          return (
       
          <div key={i}>
           <div className="card blue-grey darken-1 col s12 m4" id="test">
            <div className="card-content white-text">
              <span className="card-title">{card.title}</span>
              <p>{card.longVersion.slice(0, 300) + "..."}</p>
              <a className="story" id="expand" href="#">read story</a>
            </div>
            <div className="card-action">
              <span className="date">{moment(card.date).format('ll')}</span>
              <i className="fa fa-exclamation-circle" id="flag" aria-hidden="true" title="mark inappropriate"><span id="flagCounter">&nbsp;&nbsp;{card.flags}</span></i>
              <i className="fa fa-heart fa-lg" id="heart" aria-hidden="true" title="like story"><button id="heartCounter" value={i} onClick={this.handleHeartClick}>{card.hearts}</button></i>
              <img className="author" src="css/ebru.jpg" alt="user_image" title="eyucesar"/>
            </div>
          </div>
        </div>
        ); // return 


      })}
      </div>
    );
  }
});

// Export the component back for use in other files
module.exports = Story;
