import React, { PureComponent } from "react";
import classNames from "classnames";

import styles from "./styles.scss";

// later add support for colors (by default) + customization  // doc 

class OverlayProgress extends PureComponent {
    getOverlayStyles() {
        const { type, progress, state } = this.props;

        const bottomTopStyle = {
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: `${progress}%`, // progress in %
        };

        switch(type) {
            case 'bottomTop':
                return bottomTopStyle;
            case 'leftRight':
                return {
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${progress}%`
                }
            default: 
                return bottomTopStyle;
        }
    }

	render() { 
        const { progress, type, state } = this.props;

		return (
			<div
				className={classNames(
					"OverlayProgress",
                    styles.OverlayProgress,
                    state
				)}
			>
                <div className={classNames("Overlay", styles.Overlay, type, styles.type)} style={this.getOverlayStyles()} />
            </div>
		);
	}
}


OverlayProgress.defaultProps = {
    type: 'bottomTop'
}

export default OverlayProgress;