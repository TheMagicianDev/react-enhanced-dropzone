import React, { Component } from "react";
import classNames from 'classnames'
import DropMessages from '../../DropMessages'

import styles from './styles.scss'

export default class CompleteComposition extends Component {
    render() {
        const { context, dragActiveMessage, dragInactiveMessage, renderFiles } = this.props;  // context here is the context from the React dropZone LIB
        
        // console.log('completecomposition=====>context '.yellow);
        // console.log(context);

        // console.log('context.getrootprops()'.red, context.getRootProps());
        // console.log('context.getInputprops()'.red, context.getInputProps());

        

		return (
            <div {...context.getRootProps()}
			    className={
                    classNames(
                        'CompleteComposition', 
                        styles.CompleteComposition,
                        "dropzone", 
                        styles.dropzone, 
                        { // work on styling this 
                            "dragActive": context.isDragActive
                        },
                        { // work on styling this 
                            [styles.dragActive]: context.isDragActive
                        }
                    )
                }
            >
                <input {...context.getInputProps()} />
                <DropMessages 
                    isDragActive={context.isDragActive}
                    dragActiveMessage={dragActiveMessage}
                    dragInactiveMessage={dragInactiveMessage}
                />
            
                {
                    renderFiles()
                }
            </div>
        );
	}
}
