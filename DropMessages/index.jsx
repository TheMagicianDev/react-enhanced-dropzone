import React, { PureComponent } from "react";
import classNames from "classnames";

import styles from "./styles.module.scss";

class DropMessages extends PureComponent {
	render() {
		const {
			isDragActive,
			dragActiveMessage,
			dragInactiveMessage,
			moduleStyles
		} = this.props;

		return (
			<div className={classNames("DropMessage", styles.DropMessages, moduleStyles.DropMessages)}>
				{isDragActive ? (
					<p
						className={classNames(
							"dragActiveMessage",
							styles.dragActiveMessage,
							moduleStyles.dragActiveMessage
						)}
					>
						{dragActiveMessage}
					</p>
				) : (
					<p
						className={classNames(
							"dragInactiveMessage",
							styles.dragInactiveMessage,
							moduleStyles.dragInactiveMessage
						)}
					>
						{dragInactiveMessage}
					</p>
				)}
			</div>
		);
	}
}

DropMessages.defaultProps = {
	dragActiveMessage: 'Drop file here ...',
	dragInactiveMessage: 'Drop files here, or click to select fiels to upload'
}

export default DropMessages;