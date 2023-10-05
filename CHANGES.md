## Changes

### 2023-09-28: Version 2.1.0

#### Citation manager

Instances affected: **All with `aperture` or `colab` groups, that use the Production page**

A citation manager has been introduced to the Production page, for correcting and formatting citations and to faciliate better export to JATS. It uses AnyStyle and CrossRef services to provide suggested structured matches to existing citations, and CiteProc to format the citations.

##### Setting up CrossRef

In the Configuration page a new "Production" section contains "Email to use for citation search". You must provide a valid email address here. You can also choose citation style and locale for formatting.

##### Setting up AnyStyle (optional)

AnyStyle is an optional component of the tool, useful when CrossRef doesn't find a good match to a citation. To use AnyStyle, you must set up an AnyStyle server and database -- see `docker-compose.yml` for setup.
Then add the following to your .env, substituting your own secrets:

```
SERVICE_ANYSTYLE_CLIENT_ID=59a3392b-0c4f-4318-bbe2-f86eff6d3de4
SERVICE_ANYSTYLE_SECRET=asldkjLKJLaslkdf897kjhKUJH
SERVICE_ANYSTYLE_PROTOCOL=http
SERVICE_ANYSTYLE_HOST=anystyle
SERVICE_ANYSTYLE_PORT=4567
```

For a non-local AnyStyle server, the host will be `subdomain.domain`, and protocol will typically be `http`.

#### Imports

Instances affected: **Colab Biophysics organization _only_**

Set `USE_COLAB_BIOPHYSICS_IMPORT=true` in the `.env` file. Without this, imports specific to the Colab Biophysics organization will now be disabled. Note that for these imports to run, the group archetype must also be `colab`.

Previously, all groups using the `colab` archetype performed these imports, despite them being intended for one organization only.

In future we intend to move all imports into plugins, using the import [plugin architecture](https://docs.coko.foundation/s/f961fad5-f903-4561-9d22-b723129edf15).

### 2023-08-18: Version 2.0.0

Instances affected: **all**.<br/>

#### Multitenancy

`INSTANCE_NAME` environment variable is no longer used (but may be retained in case rollback is required). Instead, the variable `INSTANCE_GROUPS` must be supplied when upgrading Kotahi to version 2.0.0 or later.

`INSTANCE_GROUPS` is a required setting, which determines what multitenanted "groups" should run within a single instance of Kotahi. Typically, when upgrading an existing instance to 2.0.0, `INSTANCE_GROUPS` should specify a single group, though you may subsequently add further groups separated by commas to create new mulitenanted groups, each with their own data, workflow, branding and other settings (see the [FAQ](https://gitlab.coko.foundation/kotahi/kotahi/-/blob/main/FAQ.md#instance_groups-and-multitenancy) for details).

`INSTANCE_GROUPS` must contain one or more _group specifications_ separated by commas. Each _group specification_ consists of a _group name_ followed by a colon followed by a _group type_, e.g. `ourjournal:aperture`. The _group name_ (before the colon) may only contain lowercase `a`-`z`, `0`-`9` and the `_` character. The _group type_ (after the colon) must be either 'aperture', 'colab', 'elife' or 'ncrc'. (These [_group types_](https://docs.coko.foundation/doc/instance-archetypes-LFnzu7leM7) will be given more descriptive and generic names in the near future.)

Typically, to keep URLs to pages unchanged it is recommended that the _group name_ "kotahi" be used: thus, if you had `INSTANCE_NAME=aperture`, you would set `INSTANCE_GROUPS=kotahi:aperture`.

#### Flax CMS

Kotahi now also includes an inbuilt Flax content management system for generating a static website of published manuscripts and evaluations. The environment variables to support this are detailed below. Flax and Kotahi require separate DNS configurations if you wish to make Flax accessible without using a port number in the URL. A group's Flax site can be accessed (after at least one manuscript has been published) at `<FLAX_SITE_URL>/<group name>`; e.g. in local development, with the _group name_ "kotahi", the Flax site can be accessed at `http://localhost:8081/kotahi`.

#### Summary of required changes

For all existing instances, _prior to upgrading_, **configure DNS for Flax**, to point your chosen Flax domain/subdomain to your server on the flax site port. Add the following environment variables to the `.env` file:

1. `INSTANCE_GROUPS=kotahi:<group type>` where <group type> is whatever `INSTANCE_NAME` was set to.
2. `FLAX_EXPRESS_PORT=8082`
3. `FLAX_EXPRESS_HOST=kotahi-flax-site`
4. `FLAX_SITE_PORT=8081`
5. `FLAX_CLIENT_API_URL=http://client:4000`
6. `FLAX_SITE_URL=<flax site origin>` For local development, <flax site origin> is `http://localhost:8081`; for a production site it's whatever subdomain and domain you wish to configure for it.

These are typical values, but other ports etc can be chosen as desired.

### 2023-06-27

For the Aperture Neuro group _only_, you must add the following to the `.env` file prior to upgrade:

```
USE_APERTURE_EMAIL=true
```

### 2022-10-18

Instances affected: **all**.<br/>
`TEAM_TIMEZONE` should be set to the [tz database name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) of your team's main timezone (e.g. `Europe/London` if your head office is in UK). This allows correct calculation of days remaining on tasks in your task list, and will have other uses in future.

For colab instance archetype:

1. Set `SEMANTIC_SCHOLAR_IMPORTS_RECENCY_PERIOD_DAYS=42` in ENV to configure the recency period of Semantic Scholar recommended preprints

### 2022-10-14

For colab instance archetype:

1. Set `ALLOW_MANUAL_IMPORT=true` to make the 'Refresh' button appear on the manuscripts page, allowing editors and admins to manually start an import of preprints from bioRxiv.
2. Set `AUTO_IMPORT_HOUR_UTC` to an integer from `0 to 23` to cause a daily automatic import of preprints at that hour UTC.
3. Set `ARCHIVE_PERIOD_DAYS` to an integer value to cause unselected manuscripts to be automatically archived after that number of days to which they were imported into Kotahi. This feature is dependent on `AUTO_IMPORT_HOUR_UTC` also being set (see above), and archiving will occur at the same hour of the day as imports.

### 2022-08-01

eLife only: To publish fields to Hypothesis in reverse order, so that they appear in top-to-bottom order in the TRiP listing, add `HYPOTHESIS_REVERSE_FIELD_ORDER=true` to the `.env` file. See FAQ.md for details.

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
