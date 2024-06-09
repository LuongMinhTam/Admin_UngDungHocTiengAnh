import React, {useState, useEffect} from 'react';
import DashboardHeader from '../../components/DashboardHeader';

import { IconContext } from "react-icons";
import { AiFillLeftCircle, AiFillRightCircle } from "react-icons/ai";

import './styles.css';
import { deleteDataToRealTimeDB, editDataToRealTimeDB, readDataToRealTimeDB, writeDataToRealTimeDB } from '../../untils/DataHelper';
import ReactPaginate from 'react-paginate';
import { useLoaderData, useLocation } from "react-router-dom";

const Quizzs = () => {
 
    const [editingLevel, setEditingLevel] = useState(null);
    const [currentPage, setcurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPageData, setCurrentPageData] = useState([]);
    const itemsPerPage = 10;
    //Chuyển Id Lesson
    const [lessonId, setLessonId] = useState(null);
    const location = useLocation();
    const [quizzsData, setQuizzsData] = useState(null);
    const [quizzs, setQuizzs] = useState({
        Id_Lesson: lessonId, QuizzsSTT: 0, Type : '', Question: '', Answers: [], CorrectAnswer: '', Explanation: ''
    });

    useEffect(() =>{
        const searchParams = new URLSearchParams(location.search);
        const id = searchParams.get('lessonId');
        setLessonId(id);
    }, [location.search]);

    useEffect(() => {
        setQuizzs(prevState => ({...prevState, Id_Lesson: lessonId}))
    }, [lessonId]);

    useEffect(() => {
        readDataToRealTimeDB('Quizzs', setQuizzsData);
    }, []);

    const ReadQuizzsData = async () => {
        const data = await readDataToRealTimeDB('Quizzs', setQuizzsData)
        setQuizzsData(data);
    };

    useEffect(() => {
        if (quizzsData) {
            const dataKeys = Object.keys(quizzsData);
            const TotalPages = Math.ceil(dataKeys.length / itemsPerPage);
            setTotalPages(TotalPages);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentPageDataWithKeys = dataKeys.slice(startIndex, endIndex).map(key => ({
                key: key,
                ...quizzsData[key]
            }));
            setCurrentPageData(currentPageDataWithKeys);
        }
      }, [quizzsData, currentPage]);
    
    const handleDataChange = (e) => {
        const { name, value } = e.target;
        if(name === 'Id_Lesson'){
            setQuizzs(prevState => ({...prevState, Id_Lesson: value}));
        } else if (name === 'Answers') {
            setQuizzs(prevState => ({ ...prevState, Answers: value.split('\n') }));
        } else {
            setQuizzs(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newDataKey = await writeDataToRealTimeDB('Quizzs', quizzs);
        setQuizzs({ Id_Lesson: lessonId, QuizzsSTT: 0, Type : '', Question: '', Answers: [], CorrectAnswer: '', Explanation: '' }); 
        console.log(newDataKey);
    }
    const handleEdit = async (idQuizz) => {
        const lessonToUpdate = quizzsData[idQuizz];
        setQuizzs(lessonToUpdate);
        setEditingLevel(idQuizz);
        setShowModal(true);
      }
      const handleSaveEdit = async () => {
        await editDataToRealTimeDB(`Quizzs/${editingLevel}`, quizzs);
        setEditingLevel(null); 
        setQuizzs({ Id_Lesson: lessonId, QuizzsSTT: 0, Type : '', Question: '', Answers: [], CorrectAnswer: '', Explanation: '' }); 
        setShowModal(false); 
      };
      
      const handleDelete = async (idQuizz) => {
        try{
          await deleteDataToRealTimeDB(`Quizzs/${idQuizz}`);
          console.log("Quizzs deleted successfully!");
        } catch(error) {
          console.error("Error deleting Quizzs:", error);
        }
      }
    
      const handleCloseModal = () => {
        setQuizzs({  Id_Lesson: lessonId, QuizzsSTT: 0, Type : '', Question: '', Answers: [], CorrectAnswer: '', Explanation: '' });
        setShowModal(false);
    }  

return (
    <div >
        {showModal && (
        <div >
            <form onSubmit={handleSubmit}>
                <input type='number' name='QuizzsSTT' placeholder='Số thứ tự quizz' value={quizzs.QuizzsSTT} onChange={handleDataChange} required />
                <select name='Type' value={quizzs.Type} onChange={handleDataChange} required>
                    <option value=''>Chọn loại câu đố</option>
                    <option value='Choose correct answer'>Chọn đáp án đúng</option>
                    <option value='Multiple Choice'>Nhiều lựa chọn</option>
                    <option value='Fill in the Blank'>Điền vào chỗ trống</option>
                    <option value='Arrange Sentences'>Sắp xếp câu</option>
                    <option value='Read-aloud'>Đọc</option>
                    <option value='Write a Sentence'>Viết câu</option>
                </select>
                <input type='text' name='Question' placeholder='Nội dung câu hỏi' value={quizzs.Question} onChange={handleDataChange} required />
                <textarea name='Answers' placeholder='Câu trả lời (1 câu trả lời mỗi dòng)' value={quizzs.Answers ? quizzs.Answers.join('\n') : ''} onChange={handleDataChange} required />
                <input type='text' name='CorrectAnswer' placeholder='Đáp án đúng' value={quizzs.CorrectAnswer} onChange={handleDataChange} required />   
                <input type='text' name='Explanation' placeholder='Giải thích' value={quizzs.Explanation} onChange={handleDataChange} required />
                
                <button type='submit'>Submit</button>
            </form>
            <button onClick={handleCloseModal} className="btn btn-secondary">Close</button>
        </div>)}
        {quizzsData && (
            <div className="quizzsData">
                <h2 className="Title">QUIZZS</h2>
                <DashboardHeader
                btnText="New Order"
                onClick={() => setShowModal(true)} />
                <table className="table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Dạng câu hỏi</th>
                            <th>Câu hỏi</th>
                            <th>Các đáp án</th>
                            <th>Đáp án đúng</th>
                            <th>Giải thích</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(quizzsData).map((key) => {
                            const dt = quizzsData[key];
                            if(dt.Id_Lesson === lessonId){
                                let answerslist = dt.Answers.map((answer, index) => (
                                    <span key={index}>{answer}<br /></span>
                                ))
                            return(
                                <tr>
                                    <td>{dt.QuizzsSTT}</td>
                                    <td>{dt.Type}</td>
                                    <td>{dt.Question}</td>
                                    <td>{answerslist}</td>
                                    <td>{dt.CorrectAnswer}</td>
                                    <td>{dt.Explanation}</td>
                                    <td>
                                        <button onClick={() => handleEdit(key)}> Edit</button>
                                        <button onClick={() => handleDelete(key)}> Delete</button>
                                    </td>
                                </tr>
                            )}})}
                    </tbody>
                </table>
            </div>
        )}
    </div>
)
}

export default Quizzs