import axios from 'axios';
import { useEffect, useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { VscAccount } from 'react-icons/vsc';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const CommunityDetail = () => {
  const {no} = useParams();// %% URL에서 글 번호(no)를 가져옴 %%
  const [postDetail, setPostDetail] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(()=>{// 상세정보 불러오기

    axios.get(`http://localhost:8080/api/communities/${no}`)
    .then((response)=>{
      setPostDetail(response.data)
      console.log('나눔 상세 :',response.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
  },[no])

  useEffect(()=>{
    
    axios.get(`http://localhost:8080/api/communityComments`)
    .then((response) => {
      setComments(response.data)
      console.log('댓글 목록 :', response.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
  },[])

   // 좋아요 수 증가 함수
  const good = () => {
    const updatedGood = postDetail.good + 1;

  // 서버의 좋아요 수 업데이트 요청
  axios.put(`http://localhost:8080/api/communities/${no}`, {...postDetail, good: updatedGood })
    .then(response => {
      console.log('좋아요 업데이트:', response.data);
      setPostDetail(prevDetail => ({...prevDetail,good: updatedGood }));
    })
    .catch(error => {
      console.error("좋아요 업데이트 실패:", error);
    });
    
  };
          //댓글 등록 
  const handleSubmit = (e)=> {
    e.preventDefault(); // 새로고침 방지
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries()); //객체로 변환
    const now = new Date().toISOString();
    data.createdAt = now; // 현재 시간 추가
    data.post = no;
    //글 등록     
      axios.post('http://localhost:8080/api/communityComments',data)
      .then(response => {
        console.log('등록 : ',response.data)
        setComments(prevComments => [...prevComments,response.data]);
        console.log('등록 data : ',data)
      })
      .catch(error => console.error('오류 발생:', error));

      e.target.reset(); // 입력값 초기화
  }


  return (
  <>
    <ItemTitle>
      <ListImg src={`http://localhost:8080/uploads/${postDetail.imageUrl}`}
      alt={postDetail.imageUrl}
      />
      <ImgBt>
      <ImgNo>1 / 5</ImgNo>
      </ImgBt>
      <User1><VscAccount1/>작성자: {postDetail.user}</User1>
      <Title>제목: {postDetail.title}</Title>
      <Icons>
        <div>
          <Like1 onClick={()=>{good()}}/>{postDetail.good || 0}
          <Comment1/>{comments.filter((item)=>item.post === postDetail.postId).length}
        </div>
        <div>
          <ListPrice> {(postDetail.price ? `${postDetail.price.toLocaleString()}원` : <나눔>나눔</나눔>)}</ListPrice>
        </div>
      </Icons>
      <Contents>작성글: {postDetail.contents}</Contents>
      <Line />
      <CommentST>
      {comments
      .filter((item)=>item.post === postDetail.postId)
      .map((item)=>(
      <div  key={item.commentId}>
      <User2><VscAccount1/>작성자: {item.length > 0 && item[0].user}
        <ListDate key={item.commentId}>
          {new Date(item.createdAt).toLocaleDateString('ko-KR', {
            timeZone: 'Asia/Seoul' 
          })}
        </ListDate>
      </User2>
        <Comment>{item.comment}</Comment>
        </div>
      ))}
      </CommentST>
    </ItemTitle>
      <CommentFrom onSubmit={handleSubmit}>
      <input type="number" name="user"placeholder="유저번호" required/>
      <CommentCC 
        type="text"
        name="comment"
        placeholder="댓글을 달아주세요."
        required
        />
      <CommentSubmit type="submit">등록</CommentSubmit>
    </CommentFrom>
    </>
  );
};

export default CommunityDetail;

const ItemTitle = styled.div`
  display: flex;
  flex-direction: column;
  height:100% ;
  width: 100%;
  padding: 64px 25px 0px 25px;
`;

const ListImg = styled.img`
  width: 100%;
  height: 300px;
  background-color: #D9D9D9;
  border-radius: 10px;
  flex-shrink: calc(); /* 이미지 크기를 고정 */
  background-image: url(${(props) => props.src}); /* 이미지 URL 설정 */
  background-size: cover; /* 이미지를 채우도록 설정 */
  background-position: center; /* 이미지 중앙 정렬 */
`;
const ImgBt = styled.div`
  display: flex;
  position: relative;
  justify-content: flex-end;
`;
const ImgNo = styled.button`
  background-color: #8D8D8D;
  border-radius: 30px;
  font-size: 8px;
  color: white;
  border: 1px solid #8D8D8D;
  width: 35px;
  height: 20px;
  position: absolute;
  bottom: 10px;
  right: 10px;
`;
const User1 = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  margin-top:10px;
`;

const VscAccount1 = styled(VscAccount)`
  font-size: 12px;
  margin-right: 3px;
  align-items: center;
  justify-content:center ;
  `;
  const Title = styled.div`
  font-size: 20px;
  font-weight: bold;
  display: flex;
  margin: 10px 0px 10px 0px;
`;
const ListPrice = styled.div`
  font-size: 20px;
  font-weight: bold;
  display: flex;
  width: 100%;
  color: black;
`;
const 나눔 = styled.p`
  font-size: 15px;
  font-weight: bold;
  display: flex;
  width: 100%;
  color: #FF6E00;
  justify-content: end;
`;
const Icons = styled.div`
  font-size: 16px;
  color: #8D8D8D;
  display: flex;
  justify-content: space-between;
`;
const Like1 = styled(FiHeart)`
  font-size: 16px;
  color: red;
`;
const Comment1 = styled(IoChatbubbleEllipsesOutline)`
  margin-left:10px;
`;
const Contents = styled.div`
  font-size: 16px;
  margin-bottom: 10px;
  margin-top: 10px;
`;
const Line = styled.div` 
  border-top: 1px solid #FF6E00;
  margin: 10px 0px;
`;
const User2 = styled.div`
  display: flex;
  align-items: center;
  
  font-size: 12px;
  margin-top:10px;
`;
const ListDate = styled.div`
  font-size: 8px;
  color: #8D8D8D;
  display: flex;
  margin-left: 5px;
  margin-top: 2px;
`;
const Comment = styled.div`
  font-size: 12px;
  display: flex;
  
`;
const CommentST = styled.div`
  font-size: 12px;
  display: flex;
  flex-direction: column;
`;
const CommentFrom = styled.form`
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content:center ;
  margin-top: auto; 
  margin-bottom: 70px;
  justify-content: flex-end;
  `;
  const CommentCC = styled.input`
    height: 40px;
    width: 100%;
    display: flex;
    border-style: none;
    outline: none;
    background-color: #f0f0f0;
    border-width: 0.5px; 
  `;
  const CommentSubmit = styled.button`
  height: 36px;
  width: 56px;
  display: flex;
  position: absolute;
  justify-content:center;
  align-items: center;
  font-size: 14px;
  margin: 2px 2px 2px 0px;
  cursor: pointer;
  transition: border-color 0.3s ease, color 0.3s ease;
  &:hover {
  text-shadow:0px 0px 10px #8D8D8D;
  }
`;