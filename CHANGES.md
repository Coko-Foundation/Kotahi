## Changes

### 2022-06-29
- Instances affected: **Kotahi Dev**, **Aperture**, **Aperture Neuro**, and **CoLab** <br />
  `NOTIFICATION_EMAIL_CC_ENABLED`: A true value means Kotahi will use CC in automated email notifications. <br />
  ```
  NOTIFICATION_EMAIL_CC_ENABLED="false"
  ```
  <br />
- Instances affected: **Colab Biophysics** <br />
  `USE_COLAB_EMAIL`: A true value means Kotahi will use email templates for CoLab, otherwise, it will use generic email templates.
  ```
  USE_COLAB_EMAIL="false"
  ```

### 2022-05-26

- Instances affected: **elife** and **Colab Biophysics** <br />
  `HYPOTHESIS_GROUP=`(this is the Hypothe.is group id) <br />
  `HYPOTHESIS_PUBLISH_FIELDS=`(submission form and endpoint field mapping)

- **Colab Biophysics** Gmail .env variables have been updated.
  ```
  GMAIL_NOTIFICATION_EMAIL_AUTH=
  GMAIL_NOTIFICATION_EMAIL_SENDER=
  GMAIL_NOTIFICATION_PASSWORD=
  ```

### 2022-04-13

For dev instances, remove the old `minio/minio` image and container:
`docker image rm -f minio/minio`
Then rebuild containers.
