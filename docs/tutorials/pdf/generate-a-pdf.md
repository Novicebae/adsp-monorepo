---
title: Generate a PDF
layout: page
nav_order: 5
parent: PDF Service
---

## Getting Started

The PDF Service allows you to automatically build a customized PDF document from an HTML template and a set of template variable-assignments. You can use the PDF Service's [Template Editor](https://adsp.alberta.ca) to build one interactively, or use the API's to save one you already have. Either way, once you've put a template into the system you can start using it in your application to generate downloadable PDF documents for your end users.

PDF generation is accomplished through a series of API calls that create the PDF and store it within the [File Service](https://govalta.github.io/adsp-monorepo/services/file-service.html), where you have access to it through a file ID. The main steps are:

- Authenticate your application and get an access token from Keycloak,
- Initiate an asynchronous Job to generate the PDF and store it in the File Service,
- Get the File ID when the job is complete,
- present the PDF to your end user for downloading, as required

Although you can call the API's from any language, the tutorial examples are written in Node.js. Familiarity with the latter (or Javascript) is desirable, but not absolutely necessary.

Most of the API calls to the Platform Service require authentication via Keycloak with [Tenant Access](https://govalta.github.io/adsp-monorepo/services/tenant-service.html). To make the calls described in the tutorial you will need:

- A tenant, or realm ID
- A client ID, and
- A client secret

The information is specific to your program area and application. Please ask your team lead If you do not have it. New applications can get set up by following [these instruction](https://govalta.github.io/adsp-monorepo/getting-started.html)

Continuing on from the tutorial on how to [Build a Template](https://govalta.github.io/adsp-monorepo/tutorials/building-a-template.md) with the PDF service, our examples will be based on the template set up there for the Child Service's Intervention Record Check. Familiarity with that particular template is not necessary to follow along here, but the information will be useful if you want to understand how the pieces relate to each other.

## Get Access Token

Using the information required to authenticate your application, you can grab an access token required to access the PDF Service as follows:

```
const response = await fetch(
  `https://access.alberta.ca/auth/realms/${realmID}/protocol/openid-connect/token`,
  {
    method: 'POST',
    body: new URLSearchParams({
      'grant_type': 'client_credentials',
      'client_id': clientId,
      'client_secret': clientSecret,
    })
  }
);

const {
    access_token,
    expires_in,
} = await response.json();
```

## Submit a PDF Generator Job

Generating a PDF is an expensive operation and can take up to several seconds, depending on its size.  For this reason the operation is submitted to a Job Queue and performed asynchronously.  To submit a job you need to specify:

- the template ID
- a file name, and
- a file type

The template ID can be seen in your template editor while you are developing it.
** screenshot goes here **

You supply the filename, which should be something that uniquely identifies the new PDF document.

The file type is a unique classification for files that helps you group them. So, for example, you may want to have a file type for each of your templates. The advantage is that you can now easily manage all your generated PDF files for that particular template with the File Service. See the [File Service](https://govalta.github.io/adsp-monorepo/services/file-service.html) for information on how to create a new file type.

The request body for generating a new PDF will look something like this:

```
const request = {
  operation: 'generate',
  templateId: 'intervention-record-check',
  filename: 'bobs-intervention-record-check.pdf',
  fileType: 'intervention-record-checks',
  data: ircData
}
```

where ircData is a Json object containing the data collected by the application to use for variable substitutions:

```
{
  "date": "Jan 19, 2023",
  "applicant": { "firstName":"Bob", "lastName":"Smith", "middleName": "J.", "alias":"Billy", "dob":"Jan 19, 1999" },
  "caseWorker": { "name": "Bob Bing", "signature": "https://drive.google.com/uc?export=view&id=1BRi8Acu3RMNTMpHjzjRh51H3QDhshicC" },
  "reason": "I am applying to work directly with children etc.",
  "history": [{"title": "Alberta History", "content": ["Paragraph 1", "Paragraph 2", "Paragraph 3"] },
              {"title": "BC History", "content": ["Lorem ipsum dolor sit amet, etc."]},
              {"title": "England History", "content": ["Lorem ipsum dolor sit amet, etc."]}],
  "position": [{ "organization": "Downton Abby", "position": "Head Grounds Keeper"},
               { "organization": "Government of Canada", "position": "Ambassador to France"},
               { "organization": "Stanford University", "position": "Professor Emeritus"}
              ]
}
```

Generate the PDF file by submitting a Job

```
const response = await fetch(
    'https://pdf-service.adsp.alberta.ca/pdf/v1/jobs',
    {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${accessToken}`,  'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    }
);
```

which places the request on the job queue and returns the job ID and its status.

```
  const { urn,  jobId, status } = await response.json();
```

## Test for Job Completion

The status of a job will have one of three values; 'queued', 'completed', or 'failed'. Initially it is set to 'queued'. As the Job progresses it will change to one of the other values. You can poll the status to see when it has completed, or, use the Platform's Push Service.

Polling is done using GET /pdf/v1/jobs/{jobID} and testing to see if the returned status is 'completed'. The API will return a structure of the form

```
{
    urn,
    id,
    status,
    result: { urn, id, filename }
}
```

where result.id is the file ID of the PDF document.

Polling forces the application developer to manage retrying and sleeping between tries, however. A less fussy approach would be to use the [Push Service](https://govalta.github.io/adsp-monorepo/services/push-service.html). It enables applications to connect to a socket and listen for events of a specific type, such as "pdf-generated". The latter occurs when a Job successfully creates a PDF. You can connect to a Push Service socket as follows:

```
import { io } from 'socket.io-client';

const socket = io(
    `https://push-service.adsp.alberta.ca/${tenantId}?stream=pdf-generation-updates`,
    {  withCredentials: true,
       extraHeaders: {
         Authorization: `Bearer ${accessToken}` }
    }
);

socket.on('pdf-service:pdf-generated', (pdfEvent) => {
  If (pdfEvent.jobId === jobID ) {
        // Handle the event.
  }
});
```

The listener will pick up on all pdf-generated events for your tenant, so you will want to look for the one with the specific JobID. A pdfEvent has the form:

```
{
    jobId,
    templateId,
    file: { id, filename, urn },
    requestedBy
}
```

Whichever method you use, the important part is the file ID you get upon successful generation. This identifies the PDF document in the ]File Service](https://govalta.github.io/adsp-monorepo/services/file-service.html) which you can use to access it.

## Download a PDF File

The file can be downloaded via

```
await fetch(
  `https://file-service.adsp.alberta.ca/file/v1/files/${fileID}/download`,
  {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` }
  }
);
```