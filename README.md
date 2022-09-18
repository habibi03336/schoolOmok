# School Omok
## [Give it a try!](https://habibi03336.github.io/schoolOmok/)

### 1️⃣ Omok
오목의 내부 로직을 관리하는 역할  

__제공 메쏘드__
1. (void) clear() : 내부 로직을 초기화함
1. (2차원 배열) position() : 포지션 정보를 리턴
1. (배열) current_case() : 가장 최근에 둔 돌을 기준으로 오목의 모든 경우의 수(위,아래, 대각선) 반환
1. (int) current_turn() : 현재 차례 정보를 리턴
1. (string or false) make_put(point) : 놓을 수 있는 자리이면 포지션을 갱신하고, 해당 정보를 fen 형태로 반환. 놓을 수 없는 곳이면 false 반환.
1. (배열) emptyPoint_case(point) : argument로 전달한 point를 빈 곳으로 간주하고, point를 기준으로 모든 위, 아래, 대각선 경우 반환
1. (string or undefined) undo_put() : 한 턴을 undo하고 갱신된 포지션을 fen형태로 반환. undo할 것이 없으면 false 반환
1. (int) winner() : 승자가 있는지 확인, 있으면 해당 color에 대응하는 int 반환. 승자가 없으면 0 반환

---

### 2️⃣ OmokBoard
오목판과 오목돌을 구성하고, 사용자의 input 이벤트를 관리하는 역할.


🙋🏻 instance 생성시, 오목판을 넣을 부모 HTMLelement와 두 개의 콜백 함수가 있는 객체 하나를 argument로 받음.  
☞ constructor($elem, {onClickPut, onClickUndo})

__제공 메쏘드__
 1. (void) updatePosition(fen): fen정보를 바탕으로 포지션 정보 업데이트
 1. (void) drawUpdate(): 포지션 정보에 따라서 가장 최근에 놓인 돌 update 
 1. (void) drawAll(): 포지션 정보에 따라서 전체 보드 다시 그림
 1. (void) clear(): 보드 초기화

---

### 3️⃣ OmokPlayProgram
오목돌을 어디에 둘지 정하는 역할

🙋🏻 instance 생성시, programColor(constants)를 인수로 받음

__제공 메쏘드__
1. (string) put(omok): Omok 객체를 argument로 받아 둘 곳을 문자열로 반환
