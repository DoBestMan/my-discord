import { ipcRenderer } from 'electron';
import Swal from 'sweetalert2';
import api from '../../config/api_config';

const self = JSON.parse(window.localStorage.getItem('self'));
const team = JSON.parse(window.localStorage.getItem('team'));

const download = (account) => {
  ipcRenderer.on('download-file-message', (event, title, message, type) => {
    Swal.fire(title, message, type);
  });
  ipcRenderer.on('download-file-backup', (event, data) => {
    api
      .backupFile({
        uri: data.base64FileContent,
        fileName: data.fileName,
        transferType: 2,
        orgID: account.orgID,
        name: account.name,
        email: self.email,
        workspace: team.name,
      })
      .then(() => {
        // const log = {
        //   ...data,
        //   email: self.email,
        //   workspace: team.name,
        //   discordId: self.name,
        // };
        // api.logFile(log)
        //   .catch(() => {
        //     Swal.fire('Failed to log file', 'File log server is not responded.', 'error');
        //   });
        Swal.fire(
          'File Downloaded',
          'File has been successfully downloaded',
          'success'
        );
        return true;
      })
      .catch(() => {
        Swal.fire(
          'Failed to backup file',
          'File backup server is not responded.',
          'error'
        );
      });
  });
};

export default download;
