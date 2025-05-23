- Scripts set up for ESTL & MSP dispatch sheets to save pdfs to gdrive instead of emailing. once in this drive, rclone runs via a cron job on the doc server host every 5 minutes using the rclone move command, which removes the file from gdrive, moving it to the paperless consume directory on the host(/mnt/paperless_storage_ssd/consume).

- workflows to tag dispatch sheets & transfer books are based on file names including strings like "ESTL Dispatch SHeet". Paperless finds keywords for nearly all shipper tags in these files so each one has 2 workflows. 1. at time of consumption, with string match of "ESTL Dispatch SHeet", it sets the 'ESTL' and 'Dispatch sheet' tags, which are needed to trigger the step 2 flows. These run after the document is added and remove ALL tags then reassign the 'ESTL' and "dispatch sheet' tags.

# Todo
