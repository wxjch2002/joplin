import * as React from 'react';
import { Icon, Card, Chip } from 'react-native-paper';
import { _ } from '@joplin/lib/locale';
import { View } from 'react-native';
import { PluginItem } from '@joplin/lib/components/shared/config/plugins/types';
import shim from '@joplin/lib/shim';
import PluginService from '@joplin/lib/services/plugins/PluginService';
import ActionButton, { PluginCallback } from './ActionButton';

export enum InstallState {
	NotInstalled,
	Installing,
	Installed,
}

export enum UpdateState {
	Idle = 1,
	CanUpdate = 2,
	Updating = 3,
	HasBeenUpdated = 4,
}

interface Props {
	item: PluginItem;
	isCompatible: boolean;

	hasErrors?: boolean;
	installState?: InstallState;
	updateState?: UpdateState;

	onInstall?: PluginCallback;
	onUpdate?: PluginCallback;
	onDelete?: PluginCallback;
	onToggle?: PluginCallback;
	onAboutPress?: PluginCallback;
	onShowPluginLog?: PluginCallback;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Old code before rule was applied
const PluginIcon = (props: any) => <Icon {...props} source='puzzle'/>;

const PluginBox: React.FC<Props> = props => {
	const manifest = props.item.manifest;
	const item = props.item;

	const installButtonTitle = () => {
		if (props.installState === InstallState.Installing) return _('Installing...');
		if (props.installState === InstallState.NotInstalled) return _('Install');
		if (props.installState === InstallState.Installed) return _('Installed');
		return `Invalid install state: ${props.installState}`;
	};

	const installButton = (
		<ActionButton
			item={item}
			onPress={props.onInstall}
			disabled={props.installState !== InstallState.NotInstalled || !props.isCompatible}
			loading={props.installState === InstallState.Installing}
			title={installButtonTitle()}
		/>
	);

	const getUpdateButtonTitle = () => {
		if (props.updateState === UpdateState.Updating) return _('Updating...');
		if (props.updateState === UpdateState.HasBeenUpdated) return _('Updated');
		return _('Update');
	};

	const updateButton = (
		<ActionButton
			item={item}
			onPress={props.onUpdate}
			disabled={props.updateState !== UpdateState.CanUpdate || !props.isCompatible}
			loading={props.updateState === UpdateState.Updating}
			title={getUpdateButtonTitle()}
		/>
	);

	const deleteButton = (
		<ActionButton
			item={item}
			onPress={props.onDelete}
			disabled={props.item.deleted}
			title={props.item.deleted ? _('Deleted') : _('Delete')}
		/>
	);
	const disableButton = <ActionButton item={item} onPress={props.onToggle} title={_('Disable')}/>;
	const enableButton = <ActionButton item={item} onPress={props.onToggle} title={_('Enable')}/>;
	const aboutButton = <ActionButton icon='web' item={item} onPress={props.onAboutPress} title={_('About')}/>;

	const renderErrorsChip = () => {
		if (!props.hasErrors) return null;

		return (
			<Chip
				icon='alert'
				mode='outlined'
				onPress={() => props.onShowPluginLog({ item })}
			>
				{_('Error')}
			</Chip>
		);
	};

	const renderRecommendedChip = () => {
		if (!props.item.manifest._recommended || !props.isCompatible) {
			return null;
		}
		return <Chip icon='crown' mode='outlined'>{_('Recommended')}</Chip>;
	};

	const renderBuiltInChip = () => {
		if (!props.item.builtIn) {
			return null;
		}
		return <Chip icon='code-tags-check' mode='outlined'>{_('Built-in')}</Chip>;
	};

	const renderIncompatibleChip = () => {
		if (props.isCompatible) return null;
		return (
			<Chip
				icon='alert'
				mode='outlined'
				onPress={() => {
					void shim.showMessageBox(
						PluginService.instance().describeIncompatibility(props.item.manifest),
						{ buttons: [_('OK')] },
					);
				}}
			>{_('Incompatible')}</Chip>
		);
	};

	const updateStateIsIdle = props.updateState !== UpdateState.Idle;

	return (
		<Card style={{ margin: 8, opacity: props.isCompatible ? undefined : 0.75 }} testID='plugin-card'>
			<Card.Title
				title={manifest.name}
				subtitle={manifest.description}
				left={PluginIcon}
			/>
			<Card.Content>
				<View style={{ flexDirection: 'row' }}>
					{renderIncompatibleChip()}
					{renderErrorsChip()}
					{renderRecommendedChip()}
					{renderBuiltInChip()}
				</View>
			</Card.Content>
			<Card.Actions>
				{props.onAboutPress ? aboutButton : null}
				{props.onInstall ? installButton : null}
				{props.onDelete && !props.item.builtIn ? deleteButton : null}
				{props.onUpdate && updateStateIsIdle ? updateButton : null}
				{props.onToggle && props.item.enabled ? disableButton : null}
				{props.onToggle && !props.item.enabled ? enableButton : null}
			</Card.Actions>
		</Card>
	);
};

export default PluginBox;