# 기술 스택 - Snake Game

## 개요

Snake Game은 TypeScript와 HTML5 Canvas를 사용하여 브라우저에서 실행되는 순수 클라이언트 사이드 웹 게임입니다. Vite를 빌드 도구로 사용하여 빠른 개발 순환과 최적화된 프로덕션 빌드를 제공합니다.

---

## 핵심 기술 스택

### 프로그래밍 언어: TypeScript

**용도**: 게임 로직, UI 로직, 타입 안전성 확보

**선택 이유**:
- 강타입 시스템으로 런타임 오류 사전 방지
- 게임 상태(뱀, 음식, 점수) 같은 복잡한 도메인 모델을 타입으로 명확하게 표현
- IDE 자동완성 및 리팩토링 도구 지원으로 개발 생산성 향상
- 번들 크기 증가 미미 (minified 후 ~200KB 이하)

**버전**: 4.9 이상 (권장 최신 stable)

### 렌더링: HTML5 Canvas API

**용도**: 게임 화면 실시간 렌더링

**선택 이유**:
- 브라우저 기본 API로 별도 라이브러리 불필요 (최소 의존성)
- 직접적이고 예측 가능한 성능 (프레임 레이트 제어 가능)
- 2D 게임에 최적화된 저수준 API
- 모든 최신 브라우저에서 지원

**API 사용**:
- 2D 컨텍스트 (`canvas.getContext('2d')`)
- 사각형 그리기 (`fillRect`, `strokeRect`)
- 텍스트 렌더링 (`fillText`)

### 빌드 도구: Vite

**용도**: 개발 서버, 번들링, 최적화

**선택 이유**:
- 극도로 빠른 개발 서버 (Hot Module Replacement 지원)
- 기본으로 TypeScript 지원 (별도 설정 불필요)
- 프로덕션 빌드 자동 최적화 (코드 스플릿, 미니피케이션)
- 최소한의 설정으로 프로젝트 시작 가능
- 작은 게임 프로젝트에 이상적인 가벼운 도구

**버전**: 5.x 이상

---

## 개발 환경 요구사항

### 런타임
- **Node.js**: 18.0 이상
  - `node --version`으로 확인 가능
  - v18 이상에서 모던 JavaScript 기능 완전 지원

### 패키지 매니저
- **npm**: 9.0 이상 (Node.js 설치 시 포함)
  - 또는 **yarn**: 3.6 이상 (선택사항)
  - 또는 **pnpm**: 8.0 이상 (선택사항)

### 개발 에디터 (권장)
- VS Code + TypeScript 확장
- WebStorm
- Sublime Text + TypeScript 플러그인

### 운영 체제
- Windows 10 이상
- macOS 10.15 이상
- Linux (모든 주요 배포판)

---

## 의존성 및 라이브러리

### 프로덕션 의존성
**없음** - 게임 로직은 순수 TypeScript와 Canvas API만 사용합니다.

### 개발 의존성

#### 빌드 및 번들링
- **vite** (5.x): 개발 서버 및 빌드 도구
- **typescript** (4.9+): TypeScript 컴파일러

#### 테스트 (TDD)
- **vitest** (1.0+): TypeScript 친화적 단위 테스트 프레임워크
  - Jest 호환 API
  - Vite와 원활한 통합
  - 빠른 테스트 실행

#### 코드 품질
- **eslint** (8.x): 코드 스타일 및 오류 검사
  - @typescript-eslint/eslint-plugin (TypeScript 규칙)
  - @typescript-eslint/parser (TypeScript 파서)
- **prettier** (3.x): 코드 자동 포맷팅

### 최소 번들 크기 (프로덕션)
- Vite 최소 번들 (네트워크 전송): ~150KB 미만 (minified + gzip)
- 초기 로딩 시간: 1초 미만 (대부분의 네트워크 환경)

---

## 빌드 및 실행 명령어

### 개발 서버 시작
```bash
npm run dev
```
- 로컬 개발 서버 시작 (기본: http://localhost:5173)
- Hot Module Replacement 활성화 (파일 수정 시 자동 새로고침)
- 소스맵 생성 (디버깅 용이)

### 프로덕션 빌드
```bash
npm run build
```
- `dist/` 디렉토리에 최적화된 빌드 결과 생성
- 코드 최소화, 트리 셰이킹, 소스맵 생성
- 배포 준비 완료 (정적 호스팅 가능)

### 빌드된 파일 미리보기
```bash
npm run preview
```
- 로컬에서 프로덕션 빌드 결과 테스트
- 실제 배포 환경과 동일한 조건 시뮬레이션

### 테스트 실행
```bash
npm run test
```
- 모든 `.test.ts` 파일 실행
- 커버리지 리포트 생성 (권장: 85% 이상)

```bash
npm run test:watch
```
- Watch 모드에서 테스트 실행 (파일 변경 시 자동 재실행)

### 코드 검사 및 포맷팅
```bash
npm run lint
```
- ESLint로 코드 스타일 검사

```bash
npm run lint:fix
```
- ESLint와 Prettier로 코드 자동 수정

---

## 설정 파일

### `package.json`
```json
{
  "name": "snake-game",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "lint": "eslint src tests --ext .ts",
    "lint:fix": "eslint src tests --ext .ts --fix && prettier --write ."
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^4.9.0",
    "vitest": "^1.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    open: true  // 개발 서버 시작 시 브라우저 자동 열기
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false  // 프로덕션에서는 보안상 sourcemap 비활성화
  }
})
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "strict": true,
    "moduleResolution": "bundler"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "build"]
}
```

---

## 배포 옵션

### 정적 호스팅 (권장)
- **GitHub Pages**: 무료, 간단한 설정
- **Vercel**: 자동 배포, 최고의 성능
- **Netlify**: CI/CD 지원, 간단한 배포
- **Cloudflare Pages**: 빠른 로딩, 엣지 최적화

**배포 프로세스**:
1. `npm run build` 실행
2. `dist/` 디렉토리의 내용을 호스팅 서비스에 배포
3. 배포 완료 후 URL을 통해 게임 접근

### 로컬 배포 (개발/테스트)
- `npm run preview` 후 로컬 URL에서 테스트

---

## 중요 기술적 결정사항

### 데이터베이스
**사용하지 않음**. Snake Game은 순수 클라이언트 사이드 게임으로, 서버 백엔드 또는 영구 저장소가 필요하지 않습니다. 점수는 브라우저 세션 중에만 유지됩니다.

### 상태 관리
게임 상태는 간단한 TypeScript 클래스로 관리합니다 (Redux 같은 복잡한 라이브러리 불필요).

### 의존성 최소화
외부 라이브러리 의존성을 의도적으로 최소화하여 번들 크기를 작게 유지하고 학습 곡선을 낮춤.

---

## 추천 테스트 전략 (TDD)

### 테스트 프레임워크
- **Vitest**: TypeScript 및 Vite와 완벽히 통합

### 테스트 구조
- **단위 테스트**: 각 게임 로직 모듈 (Snake, Food, Collision, Score)
- **통합 테스트**: 게임 플로우 (게임 시작 → 이동 → 충돌 → 게임 오버)
- **UI 테스트**: 입력 처리, 렌더링 (필요시)

### 커버리지 목표
- **전체 커버리지**: 85% 이상
- **게임 로직**: 95% 이상 (핵심 도메인)
- **UI 로직**: 70% 이상 (렌더링은 통합 테스트로 보완)

---

## 성능 고려사항

### 렌더링 성능
- Canvas 2D 컨텍스트는 일반적으로 60 FPS 유지 가능
- `requestAnimationFrame`으로 프레임 동기화
- 불필요한 다시 그리기 최소화

### 번들 성능
- Vite의 기본 트리 셰이킹으로 미사용 코드 제거
- 사용되지 않는 import 자동 제거
- 최종 번들 크기 150KB 미만 목표

---

## 개발 워크플로우

### 1단계: 프로젝트 초기화
```bash
npm install
npm run dev
```

### 2단계: TDD 개발 순환
```bash
npm run test:watch          # Watch 모드에서 테스트 실행
# 또는 새 터미널에서
npm run dev                 # 개발 서버 실행
```

### 3단계: 코드 품질 검사
```bash
npm run lint
npm run lint:fix
```

### 4단계: 프로덕션 빌드
```bash
npm run build
npm run preview             # 로컬 테스트
```

### 5단계: 배포
`dist/` 디렉토리를 정적 호스팅 서비스에 배포

---

**문서 최종 확인 날짜**: 2026-05-24
