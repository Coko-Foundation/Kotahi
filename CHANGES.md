## Changes

### 2022-07-14

Fields for publishing are now specified in the form-builder, rather than via `HYPOTHESIS_PUBLISH_FIELDS` in the `.env` file. If `HYPOTHESIS_PUBLISH_FIELDS` is not specified, no action is necessary. Otherwise, to retain your existing publishing options, you should:

1. Determine what fields are selected in `HYPOTHESIS_PUBLISH_FIELDS`. Fields are separated by commas, and may consist of either a field name, or a field name and a tag separated by a colon (e.g. `fieldName:hypothesis tag`). You may also have a special `decision` or `reviews` pseudo-field specified. For full details of these old settings, [see here](https://gitlab.coko.foundation/kotahi/kotahi/-/blob/c51b72ec81e74aab915c46f0bdadc3975cc61bd9/FAQ.md#hypothesis).
2. For each ordinary field that was specified in `HYPOTHESIS_PUBLISH_FIELDS`, locate that field in the submission form in the form-builder, and enable "Include when sharing or publishing".
3. If a tag was specified for that field, enter it in the "Hypothes.is tag" text box.
4. If the `decision` pseudo-field was specified, locate the field in your decision form with the internal name "comment": enable "Include when sharing or publishing", and set a hypothes.is tag if one was specified.
5. If the `reviews` pseudo-field was specified, do the same for the review form.
6. You may remove `HYPOTHESIS_PUBLISH_FIELDS` from the `.env` file.

Instances publishing to Hypothes.is should add the following to their .env file:

```
HYPOTHESIS_ALLOW_TAGGING=true
```

### 2022-07-07

- Instances affected: **Kotahi Dev**, **Aperture**, **Aperture Neuro**, and **CoLab** <br />
  Following the conventions of configuration, <br />
  `NOTIFICATION_EMAIL_CC_ENABLED` and `USE_COLAB_EMAIL` will now be using `true` and `false` as values removing the quotes "". <br />

  ```
  NOTIFICATION_EMAIL_CC_ENABLED=false
  USE_COLAB_EMAIL=false
  ```

  ```
  NOTIFICATION_EMAIL_CC_ENABLED=true
  USE_COLAB_EMAIL=true
  ```

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
