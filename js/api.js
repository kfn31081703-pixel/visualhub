/**
 * API 통신 모듈
 * 가비아 MySQL API와의 통신을 담당합니다.
 */

// ⚠️ 중요: api.php 파일을 업로드한 실제 URL로 변경하세요!
// 
// 여러 경로 옵션:
// 1. 절대 URL: 'https://www.visualhub.co.kr/api.php'
// 2. 하위 폴더: 'https://www.visualhub.co.kr/db_add/api.php'
// 3. 상대 경로 (같은 폴더): 'api.php'
// 4. 루트 경로: '/api.php'
//
// 🎯 가장 쉬운 방법:
// setup.html을 열어서 "자동 경로 찾기" 버튼을 클릭하세요!
//
// 아래 URL을 실제 업로드한 경로로 변경하세요!
const API_BASE_URL = 'https://www.visualhub.co.kr/db_add/api.php';  // 👈 기본값

class DatabaseAPI {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * API 요청 헬퍼 함수 (가비아 호환: FormData 사용)
     */
    async request(action, options = {}) {
        try {
            // URL 구성 (상대/절대 경로 모두 지원)
            let url;
            const params = new URLSearchParams();
            params.append('action', action);
            
            // GET 파라미터 추가 (action과 같이 보내야 할 것들)
            if (options.params) {
                Object.keys(options.params).forEach(key => {
                    params.append(key, options.params[key]);
                });
            }
            
            // baseUrl이 절대 URL인지 확인
            if (this.baseUrl.startsWith('http://') || this.baseUrl.startsWith('https://')) {
                url = new URL(this.baseUrl);
                url.search = params.toString();
            } else {
                // 상대 경로인 경우
                url = `${this.baseUrl}?${params.toString()}`;
            }

            const config = {
                method: options.method || 'GET',
            };

            // POST 데이터 추가 (가비아 호환: FormData 사용)
            if (options.body) {
                const formData = new FormData();
                Object.keys(options.body).forEach(key => {
                    const value = options.body[key];
                    // 객체/배열은 JSON 문자열로 변환
                    if (typeof value === 'object' && value !== null) {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, value);
                    }
                });
                config.body = formData;
                // FormData 사용 시 Content-Type 자동 설정
            }

            const urlString = typeof url === 'string' ? url : url.toString();
            console.log('API 요청:', urlString);
            console.log('요청 설정:', config);

            const response = await fetch(urlString, config);
            
            console.log('응답 상태:', response.status, response.statusText);
            
            // Content-Type 확인
            const contentType = response.headers.get('content-type');
            console.log('Content-Type:', contentType);
            
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('서버 응답 (JSON 아님):', text);
                
                // HTML 에러 페이지인 경우
                if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                    throw new Error('서버에서 HTML 에러 페이지를 반환했습니다. API 파일 경로를 확인하세요.');
                }
                
                throw new Error('서버가 JSON 형식의 응답을 반환하지 않았습니다: ' + text.substring(0, 100));
            }

            const data = await response.json();
            console.log('API 응답:', data);
            
            // 응답 상태 확인 (JSON 파싱 후)
            if (!response.ok) {
                const errorMsg = data.error || `HTTP ${response.status}: ${response.statusText}`;
                const errorDetail = data.error_type ? ` (${data.error_type})` : '';
                throw new Error(errorMsg + errorDetail);
            }

            if (!data.success) {
                throw new Error(data.error || 'API 요청 실패');
            }

            return data;
        } catch (error) {
            console.error('API 요청 오류:', error);
            
            // 더 자세한 에러 메시지
            if (error.message.includes('Failed to construct')) {
                throw new Error(`잘못된 URL 형식입니다. js/api.js 파일의 API_BASE_URL을 확인하세요.\n현재 값: ${this.baseUrl}\n\nsetup.html을 사용하여 자동으로 올바른 경로를 찾으세요!`);
            }
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error(`서버에 연결할 수 없습니다.\n\n1. API URL을 확인하세요: ${this.baseUrl}\n2. api.php 파일이 업로드되었는지 확인하세요\n3. setup.html을 열어 자동 경로 찾기를 시도하세요`);
            }
            
            throw error;
        }
    }

    /**
     * 데이터베이스 연결 테스트
     */
    async testConnection() {
        return await this.request('test_connection');
    }

    /**
     * 테이블 목록 조회
     */
    async listTables() {
        return await this.request('list_tables');
    }

    /**
     * 테이블 구조 조회
     */
    async describeTable(tableName) {
        return await this.request('describe_table', {
            params: { table: tableName }
        });
    }

    /**
     * 테이블 생성
     */
    async createTable(tableName, columns) {
        // 가비아 호환: FormData(POST) 사용
        return await this.request('create_table', {
            method: 'POST',
            body: {
                tableName: tableName,
                columns: columns
            }
        });
    }

    /**
     * 테이블 삭제
     */
    async dropTable(tableName) {
        return await this.request('drop_table', {
            params: { table: tableName }
        });
    }

    /**
     * 테이블 비우기
     */
    async truncateTable(tableName) {
        return await this.request('truncate_table', {
            params: { table: tableName }
        });
    }

    /**
     * 데이터 조회
     */
    async selectData(tableName, limit = 100, offset = 0) {
        return await this.request('select_data', {
            params: {
                table: tableName,
                limit: limit,
                offset: offset
            }
        });
    }

    /**
     * 데이터 삽입
     */
    async insertData(tableName, data) {
        // 가비아 호환: FormData(POST) 사용
        return await this.request('insert_data', {
            method: 'POST',
            body: {
                table: tableName,
                data: data
            }
        });
    }

    /**
     * 데이터 수정
     */
    async updateData(tableName, data, whereCondition) {
        return await this.request('update_data', {
            method: 'POST',
            body: {
                table: tableName,
                data: data,
                where: whereCondition
            }
        });
    }

    /**
     * 데이터 삭제
     */
    async deleteData(tableName, whereCondition) {
        // 가비아 호환: FormData(POST) 사용
        return await this.request('delete_data', {
            method: 'POST',
            body: {
                table: tableName,
                where: whereCondition
            }
        });
    }

    /**
     * SQL 쿼리 실행
     */
    async executeQuery(sql) {
        // ModSecurity 우회: POST body로 전송
        return await this.request('execute_query', {
            method: 'POST',
            body: {
                sql: sql
            }
        });
    }
}

// API 인스턴스 생성
const dbAPI = new DatabaseAPI(API_BASE_URL);
