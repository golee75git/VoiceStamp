# VoiceStamp APK 빌드 가이드

반복 빌드 시간을 줄이기 위한 **최소 절차**만 정리했습니다.

## 한 줄 요약

```bat
build-apk.bat
```

완료 파일: `VoiceStamp.apk` (Release, 폰 단독 설치 가능)

---

## 빌드 전 체크 (30초)

| 확인 | 이유 |
|------|------|
| `android/` 폴더 있음 | 없으면 아래 **최초 1회 설정** 실행 |
| `android/local.properties`에 SDK 경로 | 없으면 Gradle 실패 |
| 코드만 수정했음 | `src/` 변경 → Release 재빌드 필요 |
| 아이콘만 바꿨음 | `apply-icon.bat` 후 **prebuild** 추가 필요 (아래 참고) |

**빌드 안 해도 되는 경우**

- APK 이미 있고, `src/`·`app.json`·`assets` 아이콘을 바꾸지 않았을 때

---

## 예상 소요 시간

| 상황 | Release APK |
|------|-------------|
| **첫 빌드** (SDK/NDK 다운로드 포함) | 30~60분 |
| **코드 수정 후** (캐시 있음) | **5~15분** |
| **코드 변경 없이** 다시 빌드 | 1~5분 |

`gradle.properties`에 `reactNativeArchitectures=arm64-v8a` 설정됨 → 실기기용 1종만 빌드해 시간 단축.

---

## 표준 빌드 절차

### 1) Release APK (폰 테스트용, 권장)

```bat
cd C:\VoiceStamp
build-apk.bat
```

또는 PowerShell:

```powershell
cd C:\VoiceStamp\android
$env:ORG_GRADLE_PROJECT_reactNativeArchitectures="arm64-v8a"
.\gradlew.bat assembleRelease --no-daemon
cd ..
Copy-Item android\app\build\outputs\apk\release\app-release.apk VoiceStamp.apk -Force
```

### 2) 폰에 설치

1. 기존 VoiceStamp 삭제 (버전 덮어쓰기 오류 방지)
2. `VoiceStamp.apk` 전송 후 설치
3. **출처를 알 수 없는 앱** 허용
4. 카메라·마이크 권한 허용

USB:

```powershell
adb install -r C:\VoiceStamp\VoiceStamp.apk
```

---

## Debug vs Release

| | Release (`build-apk.bat`) | Debug (`build-apk.bat debug`) |
|--|---------------------------|-------------------------------|
| 파일 | `VoiceStamp.apk` | `VoiceStamp-debug.apk` |
| PC Metro | **불필요** | **필요** (`npx expo start`) |
| 빨간 화면 `Unable to load script` | 없음 | Metro 꺼지면 발생 |
| 용도 | 폰에 넘겨 테스트 | 개발 중 핫 리로드 |

**폰만으로 확인할 때는 항상 Release.**

---

## 변경 유형별 추가 작업

### `src/` 앱 코드만 수정

```bat
build-apk.bat
```

### PDF보내기 의존성 추가 (`expo-print`, `expo-sharing`)

네이티브 모듈이 추가되므로 APK 재빌드가 필요합니다.

```bat
build-apk.bat
```

### `assets/` 아이콘 변경

```bat
apply-icon.bat
npx expo prebuild --platform android --no-install
build-apk.bat
```

### `app.json` 플러그인·권한 변경

```bat
npx expo prebuild --platform android --no-install
build-apk.bat
```

### `android/` 폴더 없음 (최초 1회)

```bat
npx expo prebuild --platform android --no-install
```

`android/local.properties` 생성 (SDK 경로, 본인 PC에 맞게):

```properties
sdk.dir=C\:\\Users\\본인계정\\AppData\\Local\\Android\\Sdk
```

이후 `build-apk.bat`.

---

## 자주 나는 오류

### `SDK location not found`

`android/local.properties`에 `sdk.dir` 추가 (위 참고).

### `Unable to load script` (빨간 화면)

Debug APK + Metro 미실행. **Release APK**로 다시 설치.

### 빌드가 30분 넘게 멈춘 것 같음

- 작업 관리자에서 `java.exe` CPU 사용 여부 확인
- CPU 0%로 오래 멈춤 → `Ctrl+C` 후 `build-apk.bat` 재실행
- **첫 빌드**의 C++ 컴파일(`buildCMake`) 구간은 로그가 잠깐 없을 수 있음 (정상)

### `Port 8081 is being used`

Metro/이전 Expo 프로세스 종료 후 재시작. APK 빌드와는 무관.

---

## 빌드 속도 더 줄이기

1. **`android/`·`node_modules` 삭제하지 않기** — 캐시 유지
2. **`gradlew clean` 남용 금지** — 전체 재빌드됨
3. **arm64만 유지** — `gradle.properties`의 `reactNativeArchitectures=arm64-v8a` 유지
4. **Gradle 데몬** — 두 번째 빌드부터 `build-apk.bat`에서 `--no-daemon` 제거 검토 (약간 빨라질 수 있음)

---

## 되돌리기

| 범위 | 방법 |
|------|------|
| APK 빌드 설정 전체 | `RESTORE.md` **섹션 6** |
| 목록 수정 기능만 | `restore-edit.bat` 또는 **섹션 9** |
| PDF보내기만 | `restore-pdf.bat` 또는 **섹션 10** |
| 아이콘만 | `restore-icon.bat` 또는 **섹션 8** |

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `build-apk.bat` | Release/Debug APK 빌드 (`VoiceStamp_YYYYMMDD_HHmmss.apk`) |
| `eas.json` | EAS 클라우드 빌드용 (로컬 대안) |
| `android/gradle.properties` | arm64 단일 아키텍처 등 |
| `RESTORE.md` | 전체/부분 복구 (§8~36) |
| `docs/PROJECT.md` | 빌드·APK·커밋 이력 |
| `docs/PRD.md` | 제품 요구사항 |
