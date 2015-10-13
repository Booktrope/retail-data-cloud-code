# retail-data-cloud-code
Cloud Code for https://www.parse.com/apps/retaildata

This is a work in progress.

Please follow the cloud code development set up instructions: https://www.parse.com/docs/cloudcode/guide


You will also need to add a config folder and file into your repo. It contains keys to our repo so we don't want those saved in the repo.

You can retreive the keys from parse or from your teamtrope-rails config/application.yml file.

Below is a template of the file.

```
{
   "applications": {
        "_default": {
            "link": "devRetailData"
        }, 
        "devRetailData": {
            "applicationId": "", 
            "masterKey": ""
        }, 
        "retailData": {
            "applicationId": "", 
            "masterKey": ""
        }
    }, 
    "global": {
        "parseVersion": "1.2.12"
    }
}
```
