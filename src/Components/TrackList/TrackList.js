import './TrackList.css'
import React from "react";
import Track from "../Track/Track";

class TrackList extends React.Component {
  render() {
    return (
      <div className="TrackList">
        {this.props.tracks.map(track => {
          return (
            <li key={track.uri}>
              <Track
                track={track}
                onAdd={this.props.onAdd}
                onRemove={this.props.onRemove}
                isRemoval={this.props.isRemoval}
              />
            </li>
          );
        })}
      </div>
    );
  }
}

export default TrackList;
