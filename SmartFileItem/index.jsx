import React, { PureComponent } from "react";
import FileItem from "../FileItem";
import classNames from "classnames";

/// important add cancel per file action X  !!!

export default class SmartFileItem extends PureComponent {
    renderFileItemFromFile() {
        const { file, progress, progressConfig, preview, uploadTime, state, onClick } = this.props; // file here is the javascript File object that extend the Blob. (Can be Blob two maybe)

        // uploadTime (contain start and end)
        // upload State (work display for state)

        // console.log('renderfile item forme file\n )=', 'color:white;background: red;')
        // console.log(file);

        // console.log("%c PROGRESS SMART ITEM", "color: yellow; background: blue;");
        // console.log(progress);

        if (file) {

            if (file.type.includes('video')) {
                let fileURL = URL.createObjectURL(file);
    
                return (
                    <FileItem 
                        state={state}
                        preview={
                            preview ? 
                            {
                                type: 'video',                                
                                config: {
                                    url: fileURL 
                                }
                            } 
                            :
                            null
                        }
                        name={file.name}
                        size={file.size}
                        progress={progress}
                        progressConfig={progressConfig}
                        icon={{
                            type: 'video'
                        }}
                        onClick={onClick}
                    />
                );
            } 
            else if (file.type.includes('image')) {
                let fileURL = URL.createObjectURL(file);
    
                return (
                    <FileItem
                        state={state}
                        preview={
                            preview? 
                            {
                                type: 'image',
                                config: {
                                    url: fileURL 
                                }
                            }
                            :
                            null
                        }
                        name={file.name}
                        size={file.size}
                        progress={progress}
                        progressConfig={progressConfig}
                        icon={{
                            type: 'image'
                        }}
                        lastModified={file.lastModified}
                        onClick={onClick}
                    />
                );
            }
    
            // otherwise default
            return (
                <FileItem // no preview
                    state={state}
                    name={file.name}
                    size={file.size}
                    progress={progress}
                    progressConfig={progressConfig}
                    icon={{
                        type: file.type
                    }}
                    lastModified={file.lastModified}
                    onClick={onClick}
                />
            );
        } else {
            return null;
        }
    }

	render() {
		return <div className={classNames("SmartFileItem")}>
            {
                this.renderFileItemFromFile()
            }
        </div>;
	}
}
