@REQ_CS-224 @file-service
Feature: File service

  @TEST_CS-311 @REQ_CS-232 @regression @api
  Scenario Outline: As a developer of a GoA digital service, I can get a map of urns to urls for all available services
    Given a testing mapping of "<Name>", "<Service>" and "<Service URL>" is inserted with "<RequestURL>"
    When the user sends a discovery request with "<RequestURL>"
    Then the user should get a map of logical names to urls for all services
    # Verify the URLs are from Dev or preprod or prod
    # And the user verifies that all urls are for the corrected deployed environment
    When the user sends a delete request of "<Name>" with "<RequestURL>"
    Then the testing mapping is removed
    Examples:
      | RequestURL        | Name   | Service | Service URL     |
      | /api/discovery/v1 | arcgis | maps    | maps.alberta.ca |

  @TEST_CS-344 @REQ_CS-232 @regression @api
  Scenario Outline: As a developer of a GoA digital service, I can discover individual service URL
    Given a testing mapping of "<Name>", "<Service>" and "<Service URL>" is inserted with "<Request URL>"
    When the user sends a discovery request with "<Request URL With Urn>"
    Then the user should get "<Service URL>" with a mapped URL for the individual service
    When the user sends a delete request of "<Name>" with "<Request URL>"
    Then the testing mapping is removed
    Examples:
      | Request URL       | Request URL With Urn                          | Name   | Service | Service URL     |
      | /api/discovery/v1 | /api/discovery/v1/urn?urn=urn:ads:arcgis:maps | arcgis | maps    | maps.alberta.ca |

  @TEST_CS-317 @REQ_CS-233 @regression @api
  Scenario Outline: As a developer of a GoA digital service, I can reference files using an urn
    Given a testing mapping of "<Name>", "<Service>" and "<Service URL>" is inserted with "<Request URL>"
    When the user sends a discovery request with "<Request URL With Urn And File Resource Path>"
    Then the user can get the URL with "<File Resource URL>"
    When the user sends a delete request of "<Name>" with "<Request URL>"
    Then the testing mapping is removed
    Examples:
      | Request URL       | Request URL With Urn And File Resource Path                          | Name   | Service | Service URL     | File Resource URL                     |
      | /api/discovery/v1 | /api/discovery/v1/urn?urn=urn:ads:arcgis:maps:/files/v1/files/123456 | arcgis | maps    | maps.alberta.ca | maps.alberta.ca/files/v1/files/123456 |

  @TEST_CS-438 @REQ_CS-227 @regression @api
  Scenario Outline: As a developer of a GoA digital service, I can consume the file service API to upload files from my service
    When a developer of a GoA digital service sends a file upload request with "<Request Endpoint>", "<Type Name>", "<File Name>" and "<Record Id>"
    Then "<Status Code>" is returned for the file upload request as well as a file urn with a successful upload

    Examples:
      | Request Endpoint | Type Name      | File Name         | Record Id              | Status Code |
      | /file/v1/files/  | autotest-type3 | autotest-new.txt  | autotest-recordid-new  | 200         |
      | /file/v1/files/  | autotest-type4 | autotest-new2.txt | autotest-recordid-new2 | 401         |

  @TEST_CS-439 @REQ_CS-227 @regression @api
  Scenario Outline: As a developer of a GoA digital service, I can consume the file service API to download files from my service
    When a developer of a GoA digital service sends a file download request with "<Request endpoint>", "<Request Type>", "<Type>", "<File Name>", "<Record Id>" and "<Anonymous>"
    Then "<Status Code>" is returned for the file upload request

    Examples:
      | Request endpoint                 | Request Type | Type           | File Name          | Record Id           | Status Code | Anonymous      |
      | /file/v1/files/<fileid>/download | GET          | autotest-type3 | autotest-file3.pdf | autotest-recordid-3 | 200         | AnonymousFalse |
      | /file/v1/files/<fileid>/download | GET          | autotest-type4 | autotest-file4.pdf | autotest-recordid-4 | 401         | AnonymousFalse |
      | /file/v1/files/<fileid>/download | GET          | autotest-type5 | autotest-file5.pdf | autotest-recordid-5 | 200         | AnonymousTrue  |

  @TEST_CS-440 @REQ_CS-227 @regression @api
  Scenario Outline: As a developer of a GoA digital service, I can consume the file service API to get file metadata from my service
    When a developer of a GoA digital service sends a file metadata request with "<Request endpoint>", "<Request Type>", "<Type>", "<File Name>" and "<Record Id>"
    Then "<Status Code>" is returned for the file upload request as well as "<File Name>", file size and created time with a succesful request

    Examples:
      | Request endpoint        | Request Type | Type           | File Name          | Record Id           | Status Code |
      | /file/v1/files/<fileid> | GET          | autotest-type3 | autotest-file3.pdf | autotest-recordid-3 | 200         |
      | /file/v1/files/<fileid> | GET          | autotest-type4 | autotest-file4.pdf | autotest-recordid-4 | 401         |