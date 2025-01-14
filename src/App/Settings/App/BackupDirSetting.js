// External
import { useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';

// Internal
import { updateSettings } from 'lib/settings';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';

__ = __context('Settings.Application');

export default function SettingsApp() {
  const backupDir = useSelector((state) => state.settings.backupDirectory);

  const browseBackupDir = async () => {
    const folderPaths = await ipcRenderer.invoke('show-open-dialog', {
      title: __('Select backup directory'),
      defaultPath: backupDir,
      properties: ['openDirectory'],
    });
    if (folderPaths && folderPaths.length > 0) {
      updateSettings({
        backupDirectory: folderPaths[0],
      });
    }
  };

  return (
    <SettingsField connectLabel label={__('Backup directory')}>
      {(inputId) => (
        <div className="flex stretch">
          <TextField
            id={inputId}
            value={backupDir}
            readOnly
            style={{ flexGrow: 1 }}
          />
          <Button
            fitHeight
            onClick={browseBackupDir}
            style={{ marginLeft: '1em' }}
          >
            {__('Browse')}
          </Button>
        </div>
      )}
    </SettingsField>
  );
}
