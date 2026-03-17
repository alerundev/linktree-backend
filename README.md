# linktree-backend

Express + PostgreSQL 기반 Linktree 백엔드 API

## API

| Method | Path | 설명 |
|--------|------|------|
| GET | /health | 헬스체크 |
| POST | /api/track/pageview | 페이지 방문 기록 |
| POST | /api/track/click | 링크 클릭 기록 |
| GET | /api/admin/stats | 전체 통계 (인증 필요) |
| GET | /api/admin/visitors | 방문자 목록 (인증 필요) |
| GET | /api/admin/clicks | 클릭 목록 (인증 필요) |

Admin API는 `x-admin-token` 헤더 필요.

## 환경변수

`.env.example` 참고

## 마이그레이션

```bash
npm run migrate
```

## 클라우드타입 배포

- 서비스 타입: Node.js
- 빌드 명령: `npm install`
- 시작 명령: `npm start`
- 포트: 4000
