import React, { PureComponent } from "react";
import classNames from "classnames";

import OverlayProgress from '../Progress/Overlay';

import styles from "./styles.scss";

class FileItem extends PureComponent {
    previewInnerOnClick = () => {
        const { onClick } = this.props;

        if (typeof onClick === 'function') onClick();
    }

    renderPreview() {
        const { preview, onClick, progress } = this.props;

        if (!preview) {
            return null;
        }

        let previewInner;

        switch (preview.type) {
            case 'video': 
                previewInner =  <video src={preview.config.url} controls onClick={this.previewInnerOnClick}/>;
                break;
            case 'image': 
                previewInner = <img src={preview.config.url} alt='' onClick={onClick}/>;
                break;
            default:
                return null;
        }

        return <div className={classNames("preview", styles.perview, preview.type, styles[preview.type])} /*onClick={onClick}*/>
            {
                previewInner
            }
        </div> // you may like to add a class to distinct the types
    }

    renderProgress() {
        const { progress, progressConfig, state } = this.props;


        switch (progressConfig.type || null) {
            case 'Overlay':
                return <OverlayProgress progress={progress} type={progressConfig.direction} state={state} />
            default: // we going with Overlay
                return <OverlayProgress progress={progress} type={progressConfig.direction} state={state}/>

        }

        // support more later
    }

    renderIcon() {
        const { icon } = this.props;
        // to be treated later
    }

    fileItemOnClick = (evt) => {
        evt.persist(); 
        evt.stopPropagation();
    }

	render() {
        const { name, renderProgress, renderIcon, size, type, lastModified } = this.props;

		return (
			<div className={classNames("FileItem", styles.FileItem)}
            onClick={this.fileItemOnClick}
            >
                {/* {
                    renderIcon &&
                    this.renderIcon()
                } */}
                {
                    this.renderPreview()
                }

				{
                    name &&

                    <div className={classNames("name", styles.name)}>
                        {
                            name
                        }
                    </div>
                }

                {   renderProgress &&
                    this.renderProgress()
                }
			</div>
		);
	}
}

FileItem.defaultProps = {
    progress: 0,
    preview: null,
    progressConfig: {
        type: 'Overlay',
        direction: 'bottomTop'
    },
    renderProgress: true,
    previewIcon: false
};

export default FileItem;
