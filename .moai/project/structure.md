# 프로젝트 구조 - Snake Game

## 목표 디렉토리 구조

다음은 Vite + TypeScript 기반 웹 게임 프로젝트의 권장 구조입니다. 이 구조는 모듈식 아키텍처와 TDD 개발을 지원하도록 설계되었습니다.

```
snake-game/
├── index.html                 # 애플리케이션 진입점
├── vite.config.ts            # Vite 빌드 설정
├── tsconfig.json             # TypeScript 컴파일러 설정
├── package.json              # 프로젝트 메타데이터 및 의존성
├── package-lock.json         # 의존성 잠금 파일
├── .gitignore               # Git 무시 파일 목록
│
├── src/
│   ├── main.ts              # 애플리케이션 메인 진입점 (Canvas 초기화)
│   ├── index.css            # 전역 스타일
│   │
│   ├── game/                # 게임 로직 모듈 (핵심 게임 엔진)
│   │   ├── Board.ts         # 게임판 상태 및 렌더링
│   │   ├── Snake.ts         # 뱀 상태 관리 및 이동 로직
│   │   ├── Food.ts          # 음식 생성 및 위치 관리
│   │   ├── Collision.ts     # 충돌 감지 (벽/자신/음식)
│   │   ├── Score.ts         # 점수 계산 및 관리
│   │   ├── Game.ts          # 게임 상태 머신 (전체 게임 조율)
│   │   └── types.ts         # 공유 타입 정의 (Position, Direction 등)
│   │
│   ├── ui/                  # 사용자 인터페이스 모듈
│   │   ├── Renderer.ts      # Canvas 렌더링 및 그리기 (장애물 렌더링 포함)
│   │   ├── InputHandler.ts  # 키보드/터치 입력 처리
│   │   ├── DifficultyPanel.ts # 난이도 선택 UI 컴포넌트 [SPEC-GAME-002]
│   │   ├── themes/          # 색상 테마 저장소 (미구현)
│   │   │   ├── light.ts     # 라이트 테마 설정
│   │   │   ├── dark.ts      # 다크 테마 설정
│   │   │   └── themes.ts    # 테마 매니저
│   │   └── GamePanel.ts     # 점수 및 상태 UI 컴포넌트
│   │
│   └── config/              # 설정 및 상수
│       ├── constants.ts      # 게임 상수 (보드 크기, 기본 속도)
│       ├── difficulty.ts     # 난이도 설정 프로필 [SPEC-GAME-002]
│       └── defaults.ts       # 기본값 설정
│
├── tests/                   # 단위 및 통합 테스트
│   ├── game/
│   │   ├── Snake.test.ts    # 뱀 로직 테스트
│   │   ├── Food.test.ts     # 음식 생성 테스트
│   │   ├── Collision.test.ts # 충돌 감지 테스트 (장애물 충돌 포함)
│   │   ├── Score.test.ts    # 점수 계산 테스트
│   │   ├── Game.test.ts     # 게임 상태 머신 테스트
│   │   ├── Difficulty.test.ts # 난이도 설정 및 적용 테스트 [SPEC-GAME-002]
│   │   └── Obstacle.test.ts  # 장애물 충돌/음식 생성/초기 배치 테스트 [SPEC-GAME-002]
│   │
│   ├── ui/
│   │   ├── InputHandler.test.ts # 입력 처리 테스트
│   │   ├── Renderer.test.ts     # 렌더링 테스트
│   │   └── DifficultyPanel.test.ts # 난이도 선택 UI 테스트 [SPEC-GAME-002]
│   │
│   ├── integration/         # 통합 테스트
│   │   └── GameFlow.test.ts # 전체 게임 플로우 테스트
│   │
│   └── fixtures/            # 테스트 데이터
│       └── gameStates.ts    # 테스트용 게임 상태 샘플
│
├── public/                  # 정적 자산 디렉토리
│   ├── icons/              # 게임 아이콘 (favicon 등)
│   └── fonts/              # 맞춤 폰트 파일 (필요시)
│
└── docs/                    # 추가 문서
    ├── ARCHITECTURE.md      # 게임 아키텍처 설명
    ├── GAMEPLAY.md          # 게임 규칙 및 메커니즘
    └── DEVELOPMENT.md       # 개발 가이드
```

---

## 디렉토리 설명

### `src/` - 소스 코드
프로젝트의 모든 TypeScript 소스 코드를 포함합니다.

#### `src/game/` - 게임 로직 모듈
게임의 핵심 기능을 담당하는 순수 로직 모듈들:

- **Snake.ts**: 뱀의 신체 세그먼트, 이동 방향, 이동 로직
- **Food.ts**: 음식의 현재 위치, 랜덤 생성 알고리즘
- **Collision.ts**: 벽 충돌, 자체 충돌, 음식 섭취 감지 (SPEC-GAME-002에서 장애물 충돌 추가)
- **Score.ts**: 점수 계산, 난이도별 점수 배정
- **Game.ts**: 게임 루프, 상태 관리 (실행 중/일시정지/게임 오버), 틱 주기 제어 [SPEC-GAME-002]
- **types.ts**: 공유 인터페이스 (Position, Direction, GameState 등)

#### `src/ui/` - 사용자 인터페이스 모듈
렌더링, 입력 처리, UI 컴포넌트:

- **Renderer.ts**: Canvas API를 이용한 게임 화면 그리기 (SPEC-GAME-002에서 장애물 렌더링 추가)
- **InputHandler.ts**: 키보드 이벤트 및 터치 입력 처리
- **DifficultyPanel.ts**: 난이도 선택 UI [SPEC-GAME-002]
- **themes/**: 색상 테마 관리 (라이트/다크 모드 등) — 미구현
- **GamePanel.ts**: 점수 표시, 게임 상태 표시

#### `src/config/` - 설정 및 상수
게임 파라미터:

- **constants.ts**: 게임판 크기, 셀 크기, 기본 이동 속도
- **difficulty.ts**: 각 난이도별 속도 프로필
- **defaults.ts**: 기본값 설정

### `tests/` - 테스트 코드
TDD 기반 개발을 지원하는 단위 및 통합 테스트:

- **game/**: 각 게임 로직 모듈별 유닛 테스트
- **ui/**: 입력 처리, 렌더링 테스트
- **integration/**: 게임 플로우 통합 테스트
- **fixtures/**: 테스트용 샘플 데이터

### `public/` - 정적 자산
배포 시 변경되지 않는 파일들:

- 게임 아이콘 (favicon)
- 필요시 맞춤 폰트

### `docs/` - 문서
개발자 및 사용자 문서

---

## 주요 파일 설명

### `index.html`
```html
<!-- Canvas 엘리먼트 및 기본 HTML 구조 -->
<!-- Vite가 src/main.ts를 자동으로 주입 -->
<canvas id="gameCanvas"></canvas>
<div id="ui"></div>
```

### `src/main.ts`
```typescript
// Canvas 초기화
// 게임 인스턴스 생성 및 시작
// 입력 핸들러 등록
```

### `vite.config.ts`
```typescript
// 개발 서버 설정
// 빌드 출력 설정 (dist/)
// 번들 최적화 설정
```

---

## 아키텍처 원칙

### 1. 관심사 분리 (Separation of Concerns)
- **game/**: 게임 로직 (도메인, 비즈니스 규칙)
- **ui/**: 렌더링 및 입력 (사용자 인터페이스)
- **config/**: 설정값 (환경별 파라미터)

### 2. 모듈식 설계
각 기능(뱀, 음식, 충돌)은 독립적인 모듈로 구현되어 테스트와 재사용이 용이합니다.

### 3. 타입 안전성
TypeScript의 강타입을 활용하여 런타임 오류를 최소화합니다.

### 4. 테스트 주도 개발 (TDD)
각 모듈에 대한 단위 테스트를 작성하여 동작을 검증합니다.

---

## 확장성 고려사항

- **난이도 시스템** [SPEC-GAME-002 구현]: `config/difficulty.ts`에 난이도 프로필 정의 → `Game.ts`에서 tickInterval 제어 (추가 난이도 추가 시 difficulty.ts 확장)
- **장애물 모드** [SPEC-GAME-002 구현]: `GameOptions.obstacles`로 고정 장애물 주입 → `Collision.ts`와 `Renderer.ts`에서 처리 (동적/움직이는 장애물은 SPEC-GAME-002 범위 외)
- **테마 시스템** [계획]: `ui/themes/` 디렉토리에 새로운 테마 파일 추가 → `Renderer.ts`에서 선택된 테마 적용 (SPEC-GAME-003)

---

**문서 최종 확인 날짜**: 2026-05-25 (SPEC-GAME-002 sync 반영)
