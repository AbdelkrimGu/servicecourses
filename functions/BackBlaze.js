const B2 = require('backblaze-b2');
const fs = require('fs');

const b2 = new B2({
  applicationKeyId: '6017c6eb6b0f', // or accountId: 'accountId'
  applicationKey: '0058f6c605b08bc8e1174fe328609737b3f9036ce8' // or masterApplicationKey
});

async function uploadFileToBackblaze(file) {
    console.log(file);
    var res;
    await b2.authorize();
    await b2.getUploadUrl({
        bucketId: '5600b1674c46de2b866b001f'
    }).then(async response => {
        const filePath = file.path;
        const fileContent = fs.readFileSync(filePath);
        console.log(fileContent);
        await b2.uploadFile({
            uploadUrl: response.data.uploadUrl,
            uploadAuthToken: response.data.authorizationToken,
            fileName: file.originalname,
            data: fileContent,
            onUploadProgress: (event) => {} 
        }).then(async response => {
            // Delete uploaded file
            fs.unlink(file.path, err => {
                if (err) {
                    console.error(err);
                }
            });
            console.log(response.data);
            res = await response.data
        }).catch(error => {
            console.error('Error uploading file:', error);
            throw new Error("can't upload file");
        }); 
    }).catch(error => {
        console.error('Error uploading file:', error);
        throw new Error("can't get upload link");
    });

    console.log(res);
    return res;

}

module.exports = {uploadFileToBackblaze};