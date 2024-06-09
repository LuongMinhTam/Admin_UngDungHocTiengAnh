import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { IconContext } from "react-icons";
import { AiFillLeftCircle, AiFillRightCircle } from "react-icons/ai";
import './styles.css';
import { deleteDataToRealTimeDB, editDataToRealTimeDB, readDataToRealTimeDB, writeDataToRealTimeDB } from '../../untils/DataHelper';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';

const Levels = () => {
    const [currentPage, setcurrentPage] = useState(1);
    const [levels, setLevels] = useState({
        LevelSTT: 0,
        Name: '',
        Description: '',
        NumRequired: 0
    });
    const [levelsData, setLevelsData] = useState(null);
    const [editingLevel, setEditingLevel] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPageData, setCurrentPageData] = useState([]);
    const itemsPerPage = 10;

    useEffect(() => {
        readDataToRealTimeDB('Levels', setLevelsData);
    }, []);

    useEffect(() => {
        if (levelsData) {
            const dataKeys = Object.keys(levelsData);
            const TotalPages = Math.ceil(dataKeys.length / itemsPerPage);
            setTotalPages(TotalPages);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentPageDataWithKeys = dataKeys.slice(startIndex, endIndex).map(key => ({
                key: key,
                ...levelsData[key]
            }));
            setCurrentPageData(currentPageDataWithKeys);
        }
    }, [levelsData, currentPage]);

    const handlePageClick = (event) => {
        setcurrentPage(event.selected + 1);
    }

    const handleDataChange = (e) => {
        const { name, value } = e.target;
        setLevels(prevState => ({ ...prevState, [name]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(editingLevel !== null) {
            await handleSaveEdit();
        } else {
            const newDataKey = await writeDataToRealTimeDB('Levels', levels);
            console.log('New data key: ', newDataKey);
            setLevels({ LevelSTT: 0, Name: '', Description: '', NumRequired: 0 });
            setShowModal(false);
        }
        
    }

    const handleEdit = async (idLevel) => {
        const levelToUpdate = levelsData[idLevel];
        setLevels(levelToUpdate);
        setEditingLevel(idLevel);
        setShowModal(true);
    }

    const handleSaveEdit = async () => {
        await editDataToRealTimeDB(`Levels/${editingLevel}`, levels);
        setEditingLevel(null);
        setLevels({ LevelSTT: 0, Name: '', Description: '', NumRequired: 0 });
        setShowModal(false);
    };

    const handleDelete = async (idLevel) => {
        try {
            await deleteDataToRealTimeDB(`Levels/${idLevel}`);
            console.log("Levels deleted successfully!");
        } catch (error) {
            console.error("Error deleting levels:", error);
        }
    }

    const handleCloseModal = () => {
        setLevels({ LevelSTT: 0, Name: '', Description: '', NumRequired: 0 });
        setShowModal(false);
    } 
    const handleShowModal = () => setShowModal(true);
    

    return (
        <div className='dashboard-content'>
            <DashboardHeader
                btnText="New Order"
                onClick={() => setShowModal(true)} />

            <div className='dashboard-content-container'>
                <div className='dashboard-content-header'>
                    <h2>LEVELS</h2>
                    <div className='dashboard-content-search'>
                        <input
                            type='text'
                            placeholder='Search..'
                            className='dashboard-content-input'
                        />
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>NAME</th>
                            <th>DESCRIPTION</th>
                            <th>NUMREQUIRED</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>

                    {currentPageData.length > 0 &&
                        <tbody>
                            {currentPageData.map((item, index) => (
                                <tr key={index} className='hovers'>
                                    <td>{item.LevelSTT}</td>
                                    <td>{item.Name}</td>
                                    <td>{item.Description}</td>
                                    <td>{item.NumRequired}</td>
                                    <td>
                                        <Link to={`/topics?levelId=${item.key}`}>Chi tiết</Link>
                                        <button onClick={() => handleEdit(item.key)}>Edit</button>
                                        <button onClick={() => handleDelete(item.key)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    }
                </table>
                
                {showModal && (
                    <div className='modal-main'>
                    <div class="modal-content dashboard-content-container">
                    <form onSubmit={handleSubmit}>
                        <input type='number' name='LevelSTT' placeholder='Số thứ tự ' value={levels.LevelSTT} onChange={handleDataChange} required />
                        <input type='text' name='Name' placeholder='Tên Level' value={levels.Name} onChange={handleDataChange} required  />
                        <input type='text' name='Description' placeholder='Mô tả Level' value={levels.Description} onChange={handleDataChange} required />   
                        <input type='text' name='NumRequired' placeholder='Số Topic trong Level' value={levels.NumRequired} onChange={handleDataChange} required />
                        
                        <button type='submit'>Submit</button>
                    </form>
                    <button onClick={handleCloseModal} className="btn btn-secondary">Close</button>
                </div>
                </div>
                )}
                
                    
                
                    

                {levelsData !== null ?
                    <div className='dashboard-content-footer'>
                        <ReactPaginate
                            containerClassName={"pagination"}
                            pageClassName={"page-item"}
                            activeClassName={"active"}
                            onPageChange={handlePageClick}
                            pageCount={totalPages}
                            breakLabel="..."
                            previousLabel={
                                <IconContext.Provider value={{ color: "#B8C1CC", size: "36px" }}>
                                    <AiFillLeftCircle />
                                </IconContext.Provider>
                            }
                            nextLabel={
                                <IconContext.Provider value={{ color: "#B8C1CC", size: "36px" }}>
                                    <AiFillRightCircle />
                                </IconContext.Provider>
                            }
                        />
                    </div>
                    :
                    <div className='dashboard-content-footer'>
                        <span className='empty-table'>No data</span>
                    </div>
                }
                <div className="tab-container flex-container">
                
                </div>
            </div>
        </div>
    )
}

export default Levels;
