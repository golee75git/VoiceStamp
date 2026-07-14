/**
 * VoiceStamp GS-UPLOAD-01 — Apps Script 초안
 *
 * 사용법:
 * 1) Google 스프레드시트 → 확장 프로그램 → Apps Script
 * 2) 이 파일 내용을 Code.gs에 붙여넣기
 * 3) SECRET 을 긴 랜덤 문자열로 교체
 * 4) 배포 → 새 배포 → 웹 앱
 *    - 실행 계정: 나
 *    - 액세스: 모든 사용자
 *
 * 보안: SECRET·배포 URL은 저장소/공개 이슈에 올리지 말 것.
 * 공용 시트 + EXPO_PUBLIC 토큰은 APK에서 추출 가능함을 전제로 할 것.
 */

var SECRET = 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';
var SHEET_NAME = 'Stamps';
var FOLDER_NAME = 'VoiceStamp';
/** base64 문자열 대략 상한 (~3MB binary에 해당하지 않도록 여유) */
var MAX_BASE64_CHARS = 5500000;

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ ok: false, error: 'empty_body' });
    }

    var data = JSON.parse(e.postData.contents);

    if (!data.token || data.token !== SECRET) {
      return json_({ ok: false, error: 'unauthorized' });
    }

    if (!data.id || typeof data.id !== 'string') {
      return json_({ ok: false, error: 'missing_id' });
    }

    if (!data.imageBase64 || typeof data.imageBase64 !== 'string') {
      return json_({ ok: false, error: 'missing_image' });
    }

    // data URI 접두사가 오면 제거
    var b64 = String(data.imageBase64);
    var comma = b64.indexOf(',');
    if (b64.indexOf('data:') === 0 && comma >= 0) {
      b64 = b64.substring(comma + 1);
    }

    if (b64.length > MAX_BASE64_CHARS) {
      return json_({ ok: false, error: 'too_large' });
    }

    var mime = data.mimeType || 'image/jpeg';
    if (mime !== 'image/jpeg' && mime !== 'image/jpg') {
      // 초안: JPEG만 허용 (앱에서 압축 JPEG 전송 전제)
      return json_({ ok: false, error: 'unsupported_mime' });
    }

    var folder = getOrCreateFolder_(FOLDER_NAME);
    var bytes = Utilities.base64Decode(b64);
    var blob = Utilities.newBlob(bytes, 'image/jpeg', sanitizeFileName_(data.id) + '.jpg');
    var file = folder.createFile(blob);

    // 링크 열람: 내부 전용이면 아래 한 줄을 주석 처리하고 imageUrl 대신 fileId만 쓰세요.
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var sheet = getOrCreateSheet_();
    var createdAt = data.createdAt ? new Date(Number(data.createdAt)) : new Date();

    sheet.appendRow([
      new Date(),
      data.id,
      data.title != null ? String(data.title) : '',
      data.memo != null ? String(data.memo) : '',
      createdAt,
      data.latitude != null ? data.latitude : '',
      data.longitude != null ? data.longitude : '',
      data.floor != null ? String(data.floor) : '',
      data.placeLabel != null ? String(data.placeLabel) : '',
      file.getUrl(),
      file.getId(),
    ]);

    return json_({
      ok: true,
      id: data.id,
      url: file.getUrl(),
      fileId: file.getId(),
    });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** 브라우저/헬스체크용 */
function doGet() {
  return json_({ ok: true, service: 'VoiceStamp GS-UPLOAD-01', mode: 'developer-shared-sheet' });
}

function getOrCreateFolder_(name) {
  var it = DriveApp.getFoldersByName(name);
  if (it.hasNext()) {
    return it.next();
  }
  return DriveApp.createFolder(name);
}

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'uploadedAt',
      'id',
      'title',
      'memo',
      'createdAt',
      'latitude',
      'longitude',
      'floor',
      'placeLabel',
      'imageUrl',
      'driveFileId',
    ]);
  }
  return sheet;
}

function sanitizeFileName_(id) {
  return String(id).replace(/[\\/:*?"<>|]/g, '_').substring(0, 180);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
