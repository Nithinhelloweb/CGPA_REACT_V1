import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import CustomAlert from '../components/CustomAlert';
import { getSubjects, submitCGPA, getAvailableBatches } from '../services/api';
import { gradeOptions } from '../utils/gradeOptions';
import { getRegulationForBatch } from '../utils/batchMapper';
import { isBlendedSubject } from '../utils/subjectUtils';
import { generatePDF } from '../utils/pdfGenerator';
import { fireCelebration } from '../utils/celebration';

const SGPACalculator = () => {
    const { department, semester } = useParams();
    const [username, setUsername] = useState('');
    const [batch, setBatch] = useState('');
    const [availableBatches, setAvailableBatches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [grades, setGrades] = useState({});
    const [sgpa, setSgpa] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '' });
    const [greeting, setGreeting] = useState('');

    const showAlert = (message) => {
        setAlert({ show: true, message });
    };

    const hideAlert = () => {
        setAlert({ show: false, message: '' });
    };

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const deptName = getDepartmentName(department);
                const batches = await getAvailableBatches(deptName);
                setAvailableBatches(batches);
            } catch (error) {
                console.error('Error fetching available batches:', error);
            }
        };
        fetchBatches();
    }, [department, semester]);

    useEffect(() => {
        if (batch) {
            loadSubjects();
        }
    }, [batch]);

    const loadSubjects = async () => {
        if (!batch) {
            showAlert('Please select a batch to load subjects.');
            return;
        }

        setLoading(true);
        try {
            const semesterParam = semester.replace('semester-', 'Sem-');
            const deptName = getDepartmentName(department);
            const regulation = getRegulationForBatch(batch);

            const data = await getSubjects(semesterParam, deptName, batch, regulation);
            setSubjects(data);

            // Initialize grades
            const initialGrades = {};
            data.forEach(subject => {
                initialGrades[subject._id] = '';
            });
            setGrades(initialGrades);
        } catch (error) {
            showAlert('Failed to load subjects for this page.');
        } finally {
            setLoading(false);
        }
    };

    const getDepartmentName = (deptCode) => {
        const deptMap = {
            'cse': 'CSE',
            'aids': 'AIDS',
            'aiml': 'AIML',
            'ece': 'ECE',
            'eee': 'EEE',
            'it': 'IT',
            'cyber': 'CYBER',
            'vlsi': 'VLSI',
            'ft': 'FT',
            'bt': 'BT',
            'mech': 'MECH',     // Fixed: was 'ME', now 'MECH' to match DB
            'agri': 'AGRI',     // Fixed: was 'AG', now 'AGRI' to match DB
            'civil': 'CIVIL',   // Fixed: was 'Civil', now 'CIVIL' for consistency
            'bme': 'BME',
        };
        return deptMap[deptCode] || deptCode.toUpperCase();
    };

    const handleGradeChange = (subjectId, value) => {
        setGrades({ ...grades, [subjectId]: value });
    };

    const calculateSGPA = async () => {
        if (!batch) {
            showAlert('Please select a batch before calculating SGPA.');
            return;
        }

        if (username.trim().length !== 12) {
            showAlert('Enter a valid 12-digit register number');
            return;
        }

        // Check if all subjects have grades
        const allSelected = subjects.every(subject => grades[subject._id] !== '');
        if (!allSelected) {
            showAlert('Please select grades for all subjects');
            return;
        }

        let totalCredits = 0;
        let weightedGradeSum = 0;
        const gradesForSubmission = {};

        subjects.forEach(subject => {
            const grade = parseInt(grades[subject._id]);
            gradesForSubmission[subject.label] = grade;

            if (grade > 0) {
                weightedGradeSum += grade * subject.credit;
                totalCredits += subject.credit;
            }
        });

        if (totalCredits === 0) {
            showAlert('SGPA cannot be calculated (all subjects failed).');
            return;
        }

        const calculatedSGPA = (weightedGradeSum / totalCredits).toFixed(3);
        setSgpa(calculatedSGPA);
        const newGreeting = fireCelebration(calculatedSGPA);
        setGreeting(newGreeting);

        // Submit to backend
        try {
            const title = `${semester.replace('semester-', 'Sem-')} ${getDepartmentName(department)}`;
            const regulation = getRegulationForBatch(batch);

            await submitCGPA({
                title,
                username,
                grades: gradesForSubmission,
                cgpa: calculatedSGPA,
                batch,
                regulation
            });

            showAlert('SGPA calculated successfully!');
        } catch (error) {
            showAlert('Error submitting data. Try again.');
            console.error(error);
        }
    };

    const downloadPDF = async () => {
        if (!sgpa) {
            showAlert('Please calculate your SGPA first before downloading the PDF.');
            return;
        }

        try {
            const semesterParam = semester.replace('semester-', 'Sem-');
            const deptName = getDepartmentName(department);
            const regulation = getRegulationForBatch(batch);

            await generatePDF(
                username,
                semesterParam,
                deptName,
                subjects,
                grades,
                sgpa,
                batch,
                regulation
            );
        } catch (error) {
            showAlert('Error generating PDF. Check console for details.');
        }
    };


    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 50%, #f0f0f0 100%)' }}>
            <Header />
            <Loader show={loading} />
            <CustomAlert message={alert.message} show={alert.show} onClose={hideAlert} />

            {/* User Input Section */}
            <div style={{
                margin: '20px auto',
                background: 'linear-gradient(135deg, #86d437 0%, #7bc930 100%)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                padding: '25px',
                borderRadius: '20px',
                width: '95%',
                maxWidth: '700px',
            }}>
                <h2 style={{
                    margin: '0 0 10px 0',
                    color: '#1a4704',
                    fontSize: '20px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#1a4704' }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Student Information
                </h2>

                <label htmlFor="username" style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '700',
                    fontSize: '14px',
                    color: '#1a4704'
                }}>
                    Register Number
                </label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter 12-digit register number"
                    required
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        marginBottom: '8px',
                        fontSize: '15px',
                        background: '#fff',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s'
                    }}
                />

                <label htmlFor="batch" style={{
                    display: 'block',
                    marginTop: '8px',
                    marginBottom: '8px',
                    fontWeight: '700',
                    fontSize: '14px',
                    color: '#1a4704'
                }}>
                    Academic Batch
                </label>
                <select
                    id="batch"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        fontSize: '15px',
                        background: '#fff',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                        cursor: 'pointer'
                    }}
                >
                    <option value="" disabled>-- Select Batch --</option>
                    {availableBatches.length > 0 ? (
                        availableBatches.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))
                    ) : (
                        <option value="" disabled>No batches available in DB</option>
                    )}
                </select>
            </div>

            {/* Subjects Grade Section */}
            {subjects.length > 0 && (
                <div style={{
                    margin: '20px auto',
                    background: 'linear-gradient(135deg, #a2e55f 0%, #95db52 100%)',
                    padding: '25px',
                    borderRadius: '20px',
                    width: '95%',
                    maxWidth: '700px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                }}>
                    <h2 style={{
                        margin: '0 0 20px 0',
                        color: '#1a4704',
                        fontSize: '20px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#1a4704' }}>
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                            Subject Grades
                        </span>
                        <span style={{
                            fontSize: '13px',
                            background: 'rgba(255,255,255,0.3)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontWeight: '600'
                        }}>
                            {subjects.length} Subjects
                        </span>
                    </h2>

                    {subjects.map((subject) => (
                        <div key={subject._id} style={{
                            background: '#fff',
                            padding: '16px 20px',
                            margin: '10px 0',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '15px',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}>
                            <div style={{ flex: 1 }}>
                                <label htmlFor={subject._id} style={{
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: '#222',
                                    display: 'block',
                                    marginBottom: '4px'
                                }}>
                                    {subject.label}
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#666',
                                        background: '#f0f0f0',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        display: 'inline-block'
                                    }}>
                                        {subject.credit} Credits
                                    </span>
                                    {isBlendedSubject(subject.label) && (
                                        <span style={{
                                            fontSize: '10px',
                                            color: '#0369a1',
                                            background: '#e0f2fe',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            display: 'inline-block',
                                            border: '1px solid #bae6fd'
                                        }}>
                                            Blended
                                        </span>
                                    )}
                                </div>
                            </div>
                            <select
                                id={subject._id}
                                value={grades[subject._id]}
                                onChange={(e) => handleGradeChange(subject._id, e.target.value)}
                                required
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '2px solid #ddd',
                                    background: '#fff',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    minWidth: '100px',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#04AA6D'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            >
                                {gradeOptions.map((opt, idx) => (
                                    <option
                                        key={idx}
                                        value={opt.value}
                                        disabled={opt.disabled}
                                    >
                                        {opt.text}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}

            {/* Calculate Button & Result */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '30px',
                width: '95%',
                maxWidth: '700px',
                margin: '20px auto',
                borderRadius: '20px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
            }}>
                <button
                    onClick={calculateSGPA}
                    style={{
                        background: 'linear-gradient(135deg, #04AA6D 0%, #039962 100%)',
                        color: '#fff',
                        border: 'none',
                        padding: '16px 40px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(4, 170, 109, 0.3)',
                        transition: 'all 0.3s',
                        width: '100%',
                        maxWidth: '300px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        margin: '0 auto'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(4, 170, 109, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(4, 170, 109, 0.3)';
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                        <line x1="12" y1="18" x2="12.01" y2="18"></line>
                        <line x1="8" y1="18" x2="8.01" y2="18"></line>
                        <line x1="16" y1="18" x2="16.01" y2="18"></line>
                        <line x1="8" y1="14" x2="8.01" y2="14"></line>
                        <line x1="16" y1="14" x2="16.01" y2="14"></line>
                        <line x1="12" y1="14" x2="12.01" y2="14"></line>
                        <line x1="8" y1="10" x2="8.01" y2="10"></line>
                        <line x1="16" y1="10" x2="16.01" y2="10"></line>
                        <line x1="12" y1="10" x2="12.01" y2="10"></line>
                    </svg>
                    Calculate SGPA
                </button>

                {sgpa && (
                    <div style={{
                        marginTop: '25px',
                        padding: '25px',
                        background: 'linear-gradient(135deg, #86d437 0%, #7bc930 100%)',
                        borderRadius: '15px',
                        boxShadow: '0 4px 20px rgba(134, 212, 55, 0.3)',
                        animation: 'slideUp 0.5s ease-out'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            color: '#1a4704',
                            fontWeight: '600',
                            marginBottom: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            Your SGPA
                        </div>
                        <div style={{
                            fontSize: '48px',
                            fontWeight: '800',
                            color: '#fff',
                            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                            letterSpacing: '2px'
                        }}>
                            {sgpa}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            color: '#1a4704',
                            marginTop: '10px',
                            fontWeight: '600'
                        }}>
                            {greeting}
                        </div>
                    </div>
                )}
            </div>

            {/* Download PDF Button */}
            {sgpa && (
                <div style={{ textAlign: 'center', margin: '20px auto 30px', width: '95%', maxWidth: '700px' }}>
                    <button
                        onClick={downloadPDF}
                        style={{
                            background: 'linear-gradient(135deg, #fff 0%, #fafafa 100%)',
                            color: '#04AA6D',
                            border: '3px solid #04AA6D',
                            padding: '14px 35px',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #04AA6D 0%, #039962 100%)';
                            e.target.style.color = '#fff';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 15px rgba(4, 170, 109, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #fff 0%, #fafafa 100%)';
                            e.target.style.color = '#04AA6D';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download PDF
                    </button>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default SGPACalculator;
