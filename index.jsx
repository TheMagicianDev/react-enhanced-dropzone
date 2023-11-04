/**
 * Add file name rename (in the preview)
 * multiple (at once, or in parallel)
 *
 *
 * Need to allow to append easily data with each upload (that it work well in multiple files in one request, and parallel multiple requests)
 * [use dynamic functions (calculators)]
 *
 *
 *
 * Think about all cases scenario [Handle them elegantly]
 *
 *
 *
 * --> add multiple file in one request support [a prop to specify it]
 *
 * --> multiple support for one and multiple setup (one will allow only one file )
 * for multiple => set multiple strategies
 *
 *
 * support for xhr request params headers ....etc
 *
 *
 *
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *  Add remove queued files from the drop zone!! in multiple mode!! (on hover, or just a visible handler (maybe just better ) !!! very important feature)  !! =+> either a separate metator that add that feature. Or included by default! (with a key map to activate it deactivate (i prefere the metator one (more control)))
 */

import React, { Fragment } from "react";
import classNames from "classnames";
import Dropzone from "react-dropzone";
import axios, { CancelToken } from "axios";
import { Scrollbars } from "react-custom-scrollbars";

import SmartFileItem from "./SmartFileItem";
import styles from "./styles.module.scss";
import DropMessages from "./DropMessages";
import CompleteComposition from "./DropZoneComposition/Complete";

import "./styles.scss";

// later all the constants wrote them as constants or enum and use them !!!!!!

// note for syncing between server and client you can keep a system of session id + dropzoneid something like that (for real time, the created id (which maybe can be just temporal, will be shared to all client if so it's wanted, so that all can act on it))

// VERY IMPORTANT  add event to track files change (fire at every files change (setstate(, here)) need to go through them all)  prop -> onFilesChange (params -> (files, event)  // my own event (what happen cancel, affect element))  // need use, to maintain a  history and current state overview [ Maybe it's nice to have it within the dropzone itself. can be exported and too directly used. update here update that, and so !!! well to see]

export const FAILED_STATE = "failed";
export const SUCCESS_STATE = "success";
export const ONPROGRESS_STATE = "onProgress";
export const QUEUED_STATE = "queued";
export const ABORTED_STATE = "aborted";

// either internal queuing mechanism (specially for upload) (it's strait forward filtering) [you can have the different pools for every state] [files get moved from a pole to another]
// or make support for an external queueing manager
// export the queue (use it in UploadQueue)
// make all necessary events

// onStartUpload
// onQueue
// onUploadFinish

// add support for naming and meta data adding first (with preview and all)
// before uploading or queuing
// something that will be optional

// we have submit and manual upload already implemented

class EnhancedDropZone extends React.PureComponent {
	static lastGeneratedID = EnhancedDropZone.lastGeneratedID
		? EnhancedDropZone.lastGeneratedID
		: 1;

	static getID() {
		EnhancedDropZone.lastGeneratedID++;
		return EnhancedDropZone.lastGeneratedID;
	}

	constructor(props) {
		super(props);

		this.state = {
			disabled: false,
			files: []
		};

		this.renderFilesList = this.renderFilesList.bind(this);
		this.renderFiles = this.renderFiles.bind(this);
		this.getFiles = this.getFiles.bind(this);
		this.getFiles = this.getFiles.bind(this);

		this.onUploadProgress = this.onUploadProgress.bind(this);
		this.onUploadSuccess = this.onUploadSuccess.bind(this);
		this.onUploadFailed = this.onUploadFailed.bind(this);
		this.onUploadEnd = this.onUploadEnd.bind(this);
		this.removeFailedUploadFiles = this.removeFailedUploadFiles.bind(this);
		this.uploadQueuedFiles = this.uploadQueuedFiles.bind(this);
		this.cancelAll = this.cancelAll.bind(this);
		this.cancelOnProgressUploads = this.cancelOnProgressUploads.bind(this);
		this.cancelOneFileUpload = this.cancelOneFileUpload.bind(this);
		this.cancelQueued = this.cancelQueued.bind(this);

		const {
			getInnerRef,
			getFilesFunc,
			getRemoveFailedUploadFilesMethod,
			getUploadFilesFunc,
			getAsUploadQueuedButtonFunc,
			getAsCancelAllUploadButtonFunc,
			getCancelAllFunc,
			getResetAllFunc,
			getCancelQueuedFunc
		} = this.props;

		if (typeof getFilesFunc === "function") getFilesFunc(this.getFiles); // useless with the one that come after it
		if (typeof getInnerRef === "function") getInnerRef(this);
		if (typeof getRemoveFailedUploadFilesMethod === "function")
			getRemoveFailedUploadFilesMethod(this.removeFailedUploadFiles);
		if (typeof getUploadQeuedFilesFunc === "function")
			getUploadFilesFunc(this.uploadQueuedFiles);
		if (typeof getAsUploadQueuedButtonFunc === "function")
			getAsUploadQueuedButtonFunc(this.asUploadQueuedButton);
		if (typeof getAsCancelAllUploadButtonFunc === "function")
			getAsCancelAllUploadButtonFunc(this.asCancelAllUploadButton);

		if (typeof getCancelAllFunc === "function")
			getCancelAllFunc(this.cancelAll);
		if (typeof getResetAllFunc === "function") {
			getResetAllFunc(this.resetAll);
		}
		if (typeof getCancelQueuedFunc === "function")
			getCancelQueuedFunc(this.cancelQueued);
		// add a function to manually render the files
	}

	asUploadQueuedButton = btn => {
		// console.log(
		// 	"%c asUploadQueuedButton",
		// 	"background: blue; color: yellow;"
		// );
		// console.log(btn);
		return React.cloneElement(btn, {
			onClick: () => {
				// console.log(
				// 	"%casUploadQueuedButton files = ",
				// 	"color: yellow; background: black;"
				// );
				// console.log(this.state.files);
				// console.log(this.state);
				this.uploadQueuedFiles();
				btn.props.onClick();
				// alert('hi there on CLICK AS UPLAOD QUEUQED BUTTON');
			}
		});
	};

	asCancelAllUploadButton = btn => {
		return React.cloneElement(btn, {
			onClick: this.cancelAll
		});
	};

	getFiles() {
		return this.state.files;
	}

	setFiles = files => {
		return new Promise(resolve => {
			this.setState(
				{
					...this.state,
					files
				},
				() => {
					resolve(this.state.files);
				}
			);
		});
	};

	// beforeUpload = (setFiles) => {

	// }

	// note default behavior : we send every file separatly (parallel, less time, more request, parallel connexion, tracking progress separatly, separate failing )

	// use file hash for identifying files md5
	// hashing not an option
	// check name or original path or maybe comparing the glob files

	onDrop = (acceptedFiles, rejectedFiles) => {
		// console.log(
		// 	"%cOn dorp========================",
		// 	"color: yellow;, background: black;"
		// );
		// console.log({
		// 	acceptedFiles,
		// 	rejectedFiles
		// });

		const {
			immediatUpload,
			onDrop,
			multiple,
			onDropMultipleFail,
			onDropFilter
		} = this.props;

		if (!multiple && acceptedFiles.length > 1) {
			if (typeof onDropMultipleFail === "function")
				onDropMultipleFail(
					acceptedFiles,
					this.state.files,
					this.setFiles
				);
			return;
		}

		if (typeof onDropFilter === 'function') {
			acceptedFiles = onDropFilter(acceptedFiles, this.state.files);
		}

		if (!acceptedFiles) {
			return;
		}

		this.setState(
			{
				...this.state,
				files: [
					...((multiple && this.state.files) || []), // only if multiple we keep the old one! otherwise we override
					...acceptedFiles.map(file => {
						return {
							id: EnhancedDropZone.getID(),
							file: file,
							uploadProgress: 0,
							uploadState: QUEUED_STATE,
							qeueingTime: new Date()
							// uploadStartTime: new Date(),  // not here
							// uploadEnd: new Date() // not here
						};
					})
					// ...(!multiple && [ // we peak up only the last one if there were multiple one!
					// 	{
					// 		id: EnhancedDropZone.getID(),
					// 		file: acceptedFiles[acceptedFiles.length - 1],
					// 		uploadProgress: 0,
					// 		uploadState: QUEUED_STATE,
					// 		qeueingTime: new Date()
					// 	}
					// ])
				]
			},
			() => {
				if (typeof onDrop === "function")
					onDrop(this.state, acceptedFiles, rejectedFiles); // see what you may need to pass
				// alert('drop and state completly set')
				this.filesPreviewScrollBar.scrollTop(1000000000);
				this.filesPreviewScrollBar.scrollLeft(1000000000);
				// console.log("%cSCROLL ON DROP !!!====", "color: yellow; background: blue;");
				// console.log(this.filesPreviewScrollBar);

				if (immediatUpload) {
					// alert("immediatUpload");
					// console.log("immediat upload".red);
					// console.log("*****accepted files".yellow);
					// console.log(acceptedFiles);

					// acceptedFiles.forEach(file => {
					//     console.log("file passed to upload file".blue);
					//     console.log(file);
					//     this.uploadFile(file);
					// });

					this.uploadQueuedFiles();
				}
			}
		);
	};

	uploadCreateFormData = (file) => {
		const { uploadRequest } = this.props;

		const data = new FormData();
		data.append(
			uploadRequest.uploadFileField
				? uploadRequest.uploadFileField
				: "file",
			file.file,
			file.file.name
		);
		data.append("filename", file.file.name); // use this when there is multiple files to send in one request (an option to support) !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

		if (uploadRequest.extraData) {
			// <---- !!!
			let extraData = uploadRequest.extraData;

			if (typeof extraData === "function") {
				// we can pass extraData as an object of keys
				extraData = extraData(file, this.state.files); // see what you can pass to it
			}

			Object.entries(extraData).forEach(([key, value]) => {
				data.set(key, value); // set will set only one value. append if a value already exist it will append to a formed list (the end result is a list of all appended data for the same field name) // in our specific use case it don't really matter which one we use
			});
		}

		return data;
	}

	uploadFile(file) {
		// support no multipart if that intersting (some day)
		// console.log("upload file ".red);
		// console.log(file);
		// console.log("----------------------");

		const { uploadRequest } = this.props;
		
		const data = this.uploadCreateFormData(file);

		/**
		 * Notice:: we can use extraData to override filename or anything that maybe will be added to the library and that is default. Anything in the form any key if it already exists it can be overrided.
		 *
		 * Maybe add support for one key value and  a list value (in the later you may use append (question ?  does set accept lists !!?????,,))
		 */

		// console.log("axios .....................".yellow);
		// console.log(uploadRequest.url);
		// console.log("..........................".yellow);
		// console.log(data);
		// console.log("file object ".yellow);
		// console.log(file.file);
		// console.log("..........................".yellow);

		// console.log(
		// 	"%cENHANCED DROP ZONE UPLOAD DATA =",
		// 	"color: yellow; background: black;"
		// );
		// console.log({
		// 	data: formData_data(data),
		// 	file
		// });

		axios
			.post(uploadRequest.url, data, {
				// config
				headers: {
					"content-type": "multipart/form-data"
				},
				cancelToken: new CancelToken(c => {
					this.setState({
						...this.state,
						files: this.state.files.map(_file => {
							if (_file.id === file.id) {
								return {
									..._file,
									cancel: c, // cancel handler
									uploadState: ONPROGRESS_STATE
								};
							}
							return _file;
						})
					});
				}),
				onUploadProgress: progressEvent => {
					// console.log(
					// 	"%con upload progress",
					// 	"color: yellow; background: black;"
					// );
					// console.log(progressEvent);
					this.onUploadProgress(file, progressEvent);
				}
			})
			.then(response => {
				// at possiblity for manual handling of this portion
				// some callback
				// console.log("axios after upload response".red);
				// console.log(response);
				let state;
				if (response.data.state === SUCCESS_STATE) {
					this.onUploadSuccess(file, response).then(() => {
						// waiting until the state update
						this.onUploadEnd(SUCCESS_STATE, file, 
							response);
					});
				} else {
					// handle upload failed
					this.onUploadFailed(file, response).then(() => {
						// waiting until the state update
						this.onUploadEnd(FAILED_STATE, file, response);
					});
				}

				this.onUploadEnd(state, file, response.data);
			})
			.catch(error => {
				// console.log("Axios catch");
				// alert("axios failed");
				// console.log(error);

				this.onUploadFailed(file, error.response);
			});
	}

	onUploadProgress(file, progressEvent) {
		const { onUploadProgress } = this.props;
		var percentCompleted = Math.round(
			(progressEvent.loaded * 100) / progressEvent.total
		);	

		// console.log("%conUploadProgress !!= Percent ====", "color: yellow; background: black;");
		// console.log({
		// 	percentCompleted,
		// 	uploadState: this.state
		// });

		this.setState({
			...this.state,
			files: this.state.files.map(_file => {
				if (_file.id === file.id) {
					return {
						..._file,
						uploadProgress: percentCompleted,
						uploadState: ONPROGRESS_STATE
					};
				}
				return _file;
			})
		}, () => {
			if (onUploadProgress) onUploadProgress(percentCompleted, progressEvent); // see what you can add here as parameter
		});

	}

	onUploadSuccess(file, response) {
		// data => response data
		const { onUploadSuccess } = this.props;
		return new Promise(resolve => {
			this.setState(
				{
					...this.state,
					files: this.state.files.map(_file => {
						if (_file.id === file.id) {
							return {
								..._file,
								uploadProgress: 100,
								uploadState: SUCCESS_STATE
							};
						}
						return _file;
					})
				},
				() => {
					if (onUploadSuccess)
						onUploadSuccess(file, response.data, response, this.state);
					resolve({
						file,
						data: response.data,
						response,
						uploadState: this.state
					});
				}
			);
		});
	}

	onUploadFailed(file, response) {
		const { onUploadFailed } = this.props;
	
		return new Promise(resolve => {
			this.setState(
				{
					...this.state,
					files: this.state.files.map(_file => {
						if (_file.id === file.id) {
							return {
								..._file,
								uploadState: FAILED_STATE
							};
						}

						return _file;
					})
				},
				() => {
					if (typeof onUploadFailed === 'function') onUploadFailed(file, response, this.state);
					resolve({
						file,
						response,
						uploadState: this.state
					});
				}
			);
		});
	}

	onUploadEnd(state, file, response) {
		const { onUploadEnd } = this.props;
		// do something

		if (onUploadEnd) onUploadEnd(state, file, response, this.state);
	}

	// this method allow us to trigger the remove of all failed upload files
	removeFailedUploadFiles() {
		// we will expose two one function to be used from the outside
		const { onRemoveFailedUploadFiles } = this.props;
		return new Promise(resolve => {
			this.setState(
				{
					...this.state,
					files: this.state.files.filter(_file => {
						return _file.uploadState !== FAILED_STATE;
					})
				},
				() => {
					resolve(this.state);
					if (onRemoveFailedUploadFiles)
						onRemoveFailedUploadFiles(this.state);
				}
			);
		});
	}

	cancelAll() {
		// to add optional remove from drop zone or not for the canceled upload (plus add events)
		return new Promise(resolve => {
			const newFiles = [];
			this.state.files.forEach(_file => {
				if (_file.uploadState === ONPROGRESS_STATE) {
					if (_file.cancel) _file.cancel();
					newFiles.push({
						..._file,
						uploadState: ABORTED_STATE
					});
				} else if (_file.uploadState !== QUEUED_STATE) {
					// we are removing the queued one from the file list (so not adding it)
					newFiles.push(_file);
				}
			});

			this.setState(
				{
					...this.state,
					files: newFiles
				},
				() => {
					resolve(this.state);
				}
			);
		});
	}

	resetAll = () => {
		const { resetAll } = this.props;

		const oldFilesList = this.state.files;

		this.setState(
			{
				...this.state,
				files: []
			},
			() => {
				if (typeof resetAll === "function") resetAll(oldFilesList);
			}
		);
	};

	cancelQueued() {
		return new Promise((resolve, reject) => {
			this.setState(
				{
					...this.state,
					files: this.state.files.filter(_file => {
						if (_file.uploadState === QUEUED_STATE) {
							if (_file.cancel) {
								_file.cancel();
							}
							return false;
						}
						return true;
					})
				},
				() => {
					resolve(this.state);
				}
			);
		});
	}

	cancelOnProgressUploads() {
		// maybe return promise after state is changed
		return new Promise((resolve, reject) => {
			const newFiles = [];
			this.files.forEach(_file => {
				if (_file.uploadState === ONPROGRESS_STATE) {
					if (_file.cancel) _file.cancel();
					newFiles.push({
						..._file,
						uploadState: ABORTED_STATE
					});
				} else {
					newFiles.push(_file);
				}
			});

			this.setState(
				{
					...this.state,
					files: newFiles
				},
				() => {
					resolve(this.state);
				}
			);
		});
	}

	cancelOneFileUpload(file) {
		// if the file onProgress it will cancel the upload and not remove it from the dropzone (or maybe later make it optional) !!!!
		return new Promise(resolve => {
			if (file.uploadState === ONPROGRESS_STATE) {
				if (file.cancel) file.cancel();
				this.setState(
					{
						...this.state,
						files: this.files.map(_file => {
							if (_file.id === file.id) {
								return {
									..._file,
									uploadState: ABORTED_STATE
								};
							}
							return _file;
						})
					},
					() => {
						resolve(this.state);
					}
				);
			} else if (file.uploadState === QUEUED_STATE) {
				this.setState(
					{
						files: this.state.files.filter(_file => {
							return _file.id !== file.id;
						})
					},
					() => {
						resolve(this.state);
					}
				);
			}
		});
	}

	uploadQueuedFiles() {
		const { beforeUploadQueuedFiles } = this.props;

		// console.log(
		// 	"%cUPLOAD QUEUED FILES",
		// 	"color: yellow; background: black;"
		// );
		// console.log({
		// 	files: this.state.files
		// });
		if (typeof beforeUploadQueuedFiles === "function") {
			beforeUploadQueuedFiles(this.state.files, this.setFiles, this.uploadCreateFormData).then(
				(files) => {
					// console.log('%cbefore upload queued files resolved !!! ===', 'color: yellow; background: blue;');
					// console.log(files);

					if (files) {
						if (files === true) {
							files = this.state.files;
						}

						files.forEach(file => {
							// console.log(
							// 	"%cfile.uploadState = ",
							// 	"color: red; background: white;"
							// );
							// console.log(file.uploadState);
							if (file.uploadState === QUEUED_STATE) {
								this.uploadFile(file);
							}
						});
					}
				}
			);
		} else {
			this.state.files.forEach(file => {
				// console.log(
				// 	"%cfile.uploadState = ",
				// 	"color: red; background: white;"
				// );
				// console.log(file.uploadState);
				if (file.uploadState === QUEUED_STATE) {
					this.uploadFile(file);
				}
			});
		}
	}

	multiDataAppend = () => {
		// multidata data appender
		const { multiDataAppender } = this.props;

		if (typeof multiDataAppender === "function")
			multiDataAppender(this.state.files);
	};

	// onUplaodClick() {
	//     this.uploadQueuedFiles();
	// }

	renderFiles() {
		const { filesPreviewScrollBarOptions = {} } = this.props;
		return (
			<div
				className={classNames("Files", styles.Files)}
				ref={ref => {
					this.filesContainer = ref;
				}}
			>
				<Scrollbars
					className="filesPreviewScrollBar"
					ref={scrollbar => {
						this.filesPreviewScrollBar = scrollbar;
					}}
					{...filesPreviewScrollBarOptions}
					onScrollStart={() => {
						// alert('start')
						// console.log("%conScrollStart ENHANCED DROPZONE ========", "color: yellow; background: black;");
						// console.log({
						// 	evt
						// });
						// if (this.filesScrollBarClickEvt) {
						// 	this.filesScrollBarClickEvt.stopPropagation();
						// }
						this.setState({
							...this.state,
							disabled: true
						});

						if (
							typeof filesPreviewScrollBarOptions.onScrollStart ===
							"function"
						) {
							filesPreviewScrollBarOptions.onScrollStart();
						}

						this.filesScrollbar_inScroll = true;
					}}
					onScrollStop={() => {
						// if (this.filesScrollBarClickEvt) {
						// 	this.filesScrollBarClickEvt.stopPropagation();
						// }
						// setTimeout(() => {
						// 	this.filesScrollbar_inScroll = false;
						// }, 200);

						// setTimeout(() => {
						// 	this.setState({
						// 		...this.state,
						// 		disabled: false
						// 	});
						// }, 300);

						if (
							typeof filesPreviewScrollBarOptions.onScrollStop ===
							"function"
						) {
							filesPreviewScrollBarOptions.onScrollStop();
						}
					}}
				>
					{this.renderFilesList()}
				</Scrollbars>
			</div>
		);
	}

	renderFilesList() {
		const { noFilesMessage, preview, progressConfig } = this.props;
		if (!this.state.files.length) {
			return <p>{noFilesMessage}</p>;
		}
		// console.log("%c rederFileslist", "color: white; background: red;");
		// console.log(this.state.files);

		// else
		return (
			<ul>
				{this.state.files.map(file => (
					<SmartFileItem
						key={file.id}
						file={file.file}
						preview={preview}
						onClick={(evt) => { evt.persist(); evt.stopPropagation()}}
						progress={file.uploadProgress}
						progressConfig={progressConfig}
						state={file.uploadState}
					/>
				))}
			</ul>
		);
	}

	// drop zone on click (to handle the click into the media, and the scroll bar !!!!! and so on)
	onClick = evt => {
		// console.log("%cOnclick DROPZONE", "color: yellow; background: black;");
		// console.log({
		// 	evt,
		// 	filesScrollbar_inScroll: this.filesScrollbar_inScroll,
		// 	uploadState: this.state
		// });
		// if (this.state.disabled) {
		// 	// evt.persist();
		// 	evt.stopPropagation();
		// 	alert('stop propagation');
		// }
		// alert('clicked !!!')
		// setTimeout(() => {
		// 	alert('disabled false!')
		// 	this.setState({
		// 		...this.state,
		// 		disabled: false
		// 	});
		// }, 200);
		// evt.persist();
		// if (this.filesScrollbar_inScroll) {
		// 	evt.stopPropagation();
		// 	// alert('propagation stoped')
		// }
		// this.filesScrollBarClickEvt = evt;
	};

	render() {
		const { className, children, disabled } = this.props;

		// console.log("children".red);
		// console.log(children);

		return (
			<div
				className={classNames(
					"EnhancedDropZone",
					styles.EnhancedDropZone,
					className
				)}
				onClick={() => {
					if (this.state.disabled) {
						this.setState({
							...this.state,
							disabled: false
						});
					}
				}}
			>
				<Dropzone
					disabled={disabled || this.state.disabled}
					onDrop={this.onDrop}
					onClick={this.onClick}
					// disableClick={false}  // later pass all the props that are not on Enhanced so we can always exploit what there is in Dropzone
				>
					{context => {
						const newContext = {
							// with that you have all the blocks ready for you, and you can customize as you like  (good composition pattern)
							...context,
							FileInput: props => (
								<input {...context.getInputProps()} />
							),
							DropMessages, // component
							CompleteComposition: props => {
								const {
									dragActiveMessage,
									dragInactiveMessage
								} = props;

								return (
									<CompleteComposition
										context={context}
										renderFiles={this.renderFiles}
										dragActiveMessage={dragActiveMessage}
										dragInactiveMessage={
											dragInactiveMessage
										}
									/>
								);
							},
							renderFilesList: this.renderFilesList,
							renderFiles: this.renderFiles,
							files: this.state.files,
							uploadQueuedFiles: this.uploadQueuedFiles,
							UploadQueuedFilesClick: props => (
								<Fragment onClick={this.uploadQueuedFiles}>
									{props.children}
								</Fragment>
							),
							CancelClick: props => {
								const { type } = props;

								return (
									<Fragment
										onClick={evt => {
											switch (type) {
												case "all":
													return this.cancelAll();
												case "queued":
													return this.cancelQueued();
												case "onUpload":
													return this.cancelOnProgressUploads();
												default:
													return this.cancelAll();
											}
										}}
									>
										{props.children}
									</Fragment>
								);
							},
							styles,
							this: this, // we may not need that (sure)
							asUploadQueuedButton: this.asUploadQueuedButton,
							asCancelAllUploadButton: this
								.asCancelAllUploadButton // you can add more of those
						};

						// console.log("new Context ".yellow);
						// console.log(newContext);
						// children here is a renderer prop (kept the same design as dropZOne, maybe i need to change that or may be  not (change to render prop))
						return children(newContext);
					}}
				</Dropzone>
			</div>
		);
	}
}

// review the default values
EnhancedDropZone.defaultProps = {
	preview: true,
	noFilesMessage: "No files selected!",
	// thumbnail_render  // later pass more controll to this to render the whole thing with info ...etc [meaning you provide a context with all the needed information to do whatever you want] // and because the generated default thumbnailList and it can be used (he can not to)
	// thumbnail_infoRender
	useComponentStyling: true,
	autoHandleDrop: true,
	drop: true,
	immediatUpload: true,
	uploadRequest: null,
	onUploadProgress: null,
	onUploadEnd: null
};

export default EnhancedDropZone;

function formData_data(formData) {
	const data = {};
	for (let [key, value] of formData) {
		data[key] = value;
	}
	return data;
}
