import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa'; // Impor ikon "X" dari react-icons/fa
import { format, differenceInHours } from 'date-fns';
import './EMR.css';

const EMR = () => {
    const { id } = useParams();

    const [patientDetails, setPatientDetails] = useState(null);
    const [treatments, setTreatments] = useState([]);
    const [allergies, setAllergies] = useState("");
    const [healthHistory, setHealthHistory] = useState("");
    const [zoomedImage, setZoomedImage] = useState(null);
    const isEditable = (timestamp) => {
        const hoursDifference = differenceInHours(new Date(), new Date(timestamp));
        return hoursDifference <= 24;
    };


    useEffect(() => {
        // Mengambil data pasien
        axios.get(`https://rme-shazfa-mounira-default-rtdb.firebaseio.com/patients/${id}.json`)
            .then(response => {
                setPatientDetails(response.data);

                // Mengambil data alergi dan riwayat kesehatan dari Firebase (jika ada)
                if (response.data) {
                    setAllergies(response.data.Allergies || "");
                    setHealthHistory(response.data.HealthHistory || "");
                }
            })
            .catch(error => {
                console.error('Terjadi kesalahan:', error);
            });

        // Mengambil data riwayat pengobatan
        axios.get(`https://rme-shazfa-mounira-default-rtdb.firebaseio.com/patients/${id}/medical_records.json`)
            .then(response => {
                const treatmentsArray = Object.keys(response.data).map(recordId => ({
                    id: recordId,
                    ...response.data[recordId],
                }));
                setTreatments(treatmentsArray.reverse()); // Reverse the array
            })
            .catch(error => {
                console.error('Terjadi kesalahan:', error);
            });
    }, [id]);

    const confirmDelete = (treatmentId) => {
        const isConfirmed = window.confirm("Apakah Anda yakin akan menghapus data ini?");
        if (isConfirmed) {
            deleteTreatmentRecord(treatmentId);
        }
    };

    const deleteTreatmentRecord = (treatmentId) => {
        // Hapus data riwayat pengobatan dari Firebase sesuai dengan ID treatment
        axios.delete(`https://rme-shazfa-mounira-default-rtdb.firebaseio.com/patients/${id}/medical_records/${treatmentId}.json`)
            .then(response => {
                console.log('Riwayat pengobatan berhasil dihapus');
                // Refresh data riwayat pengobatan setelah penghapusan
                const updatedTreatments = treatments.filter(treatment => treatment.id !== treatmentId);
                setTreatments(updatedTreatments);
            })
            .catch(error => {
                console.error('Terjadi kesalahan:', error);
            });
    };

    return (
        <div>
            <Link to="/home" className="home-link">
                <img src='https://firebasestorage.googleapis.com/v0/b/rekammedis-70985.appspot.com/o/images__14_-removebg-preview.png?alt=media&token=dac5fd74-4670-4ce9-a490-4f01637c2f22' />
            </Link>

            <h2>Electronic Medical Records (EMR)</h2>
            <div className="emr-container">
                <div className="patient-details">
                    {patientDetails && (
                        <div>
                            <div className="biodata-pasien">
                                <h4>Biodata Pasien</h4>
                                <h5>NIK         : {patientDetails.identifier}</h5>
                                <p>Nomor RM     : {patientDetails.number_medical_records}</p>
                                <p>Nama         : {patientDetails.name}</p>
                                <p>Tanggal Lahir: {patientDetails.birthDate}</p>
                                <p>No WhatsApp: {patientDetails.whatsappNumber}</p>
                                <p>Alergi:{allergies}</p>
                                <p>Riwayat Kesehatan: {healthHistory}</p>
                                <div className="button-wrapper">
                                    <Link to={`/emr/${id}/edit-health`} className="purple-button">
                                        Alergi & Riwayat Kesehatan
                                    </Link>
                                </div>
                                <div className="button-wrapper-soap">
                                    <Link to={{
                                        pathname: `/emr/${id}/soap`,
                                        state: { patientName: patientDetails.name }
                                    }} className="soap-icon">
                                        <img
                                            src="https://firebasestorage.googleapis.com/v0/b/rme-shazfa-mounira.appspot.com/o/Soap-Icon%20(3).png?alt=media&token=96f7a25e-7fa3-4566-9a08-4f76d947a9fc"
                                            alt="SOAP Button"
                                            className="soap-button-image"
                                            style={{ maxWidth: '360px', height: '120px' }} // Adjust size as needed
                                        />
                                    </Link>
                                </div>

                            </div>
                        </div>
                    )}
                </div>

                <div className="treatments">
                    <Link to={`/emr/${id}/tambah-pengobatan`}>
                        <img src="https://firebasestorage.googleapis.com/v0/b/rekammedis-70985.appspot.com/o/ButtonBerobat.png?alt=media&token=5f8a6c51-c2e7-44d0-9609-d5e521aa9a13" alt="Tambah Pengobatan" />
                    </Link>
                    <h3>Riwayat Pengobatan</h3>
                    {treatments
                        .slice()
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map(treatment => (
                            <div className="treatment-card" key={treatment.id}>
                                {/* Tambahkan gambar sampah */}
                                

                                {/* Display "Edit" button only if the treatment is editable */}
                                {isEditable(treatment.timestamp) ? (
                                    <Link to={`/emr/${id}/update-treatment/${treatment.id}`}>
                                        <button>Edit</button>
                                    </Link>
                                ) : (
                                    <button onClick={() => alert('Mohon maaf, fungsi edit tidak bisa dilakukan karena sudah 24 jam!')}>
                                        Edit
                                    </button>
                                )}

                                <img
                                    src="/trash.png" // Ganti dengan path menuju gambar sampah
                                    alt="Delete"
                                    className="delete-treatment-icon" // Ganti dengan nama kelas yang unik
                                    style={{ maxWidth: '80%', height: 'auto' }}
                                    onClick={() => confirmDelete(treatment.id)}
                                />

                                <p>Tanggal dan Waktu: {format(new Date(treatment.timestamp), 'dd MMMM yyyy HH:mm:ss')}</p>
                                <p>Keluhan: {treatment.complaint}</p>
                                <p>Pemeriksaan Fisik: {treatment.condition_physical_examination}</p>
                                <p>Tanda-Tanda Vital:</p>
                                <p>SystolicBloodPressure: {treatment.systolicBloodPressure}</p>
                                <p>DiastolicBloodPressure: {treatment.diastolicBloodPressure}</p>
                                <p>HeartRate: {treatment.heartRate}</p>
                                <p>HeartRate: {treatment.heartRate}</p>
                                <p>BodyTemperature: {treatment.bodyTemperature}</p>
                                <p>RespiratoryRate: {treatment.respiratoryRate}</p>
                                <p>Body Weight: {treatment.bodyWeight}</p>
                                <p>Terapi Obat: {treatment.Medication}</p>
                                <p>Diagnosis Medis: {treatment.diagnosis.code} - {treatment.diagnosis.name}</p>
                                <p>DPJP (Participant): {treatment.participant}</p>
                                {treatment.images && treatment.images.length > 0 && (
                                    <img
                                        src={treatment.images[0]} // Ganti dengan sumber gambar dari treatment
                                        alt={`Treatment ${treatment.id}`}
                                        className="treatment-image"
                                        onClick={() => setZoomedImage(treatment.images[0])}
                                    />
                                )}
                            </div>
                        ))}
                </div>

                {zoomedImage && (
                    <div className="zoom-modal" onClick={() => setZoomedImage(null)}>
                        <img src={zoomedImage} alt="Zoomed Image" className="zoomed-image" />
                    </div>
                )}

            </div>
        </div>
    );
};

export default EMR;
