import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import "./SatuSehat.css";
import Modal from "react-modal";
import { getToken } from "../services/auth";
import Mandiri from "./../Images/mandiri.jpg";

const SatuSehat = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [filterDate, setFilterDate] = useState(null);
  const [imageURL, setImageURL] = useState(
     "https://firebasestorage.googleapis.com/v0/b/rme-shazfa-mounira.appspot.com/o/HomeButton%2FSatu%20Sehat%20Icon.png?alt=media&token=d5eb8c3d-abdf-4485-89d8-bbb063c779e6"
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://rme-shazfa-mounira-default-rtdb.firebaseio.com/patients.json"
      );
      const data = response.data;

      // Convert the object into an array
      const patientsArray = Object.values(data);

      setPatients(patientsArray);
      setFilteredPatients(patientsArray); // Set initial data without filtering
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleFilter = () => {
    // Filter based on the date of Encounter_period_start
    const filteredData = patients.map((patient) => {
      const medicalRecords = Object.values(patient.medical_records || {});

      // Check if any medical record has Encounter_period_start on the selected date
      const filteredMedicalRecords = Object.values(medicalRecords).filter(
        (record) => {
          const recordDate = new Date(record.Encounter_period_start);
          const filterDateClone = new Date(filterDate);

          // Menghilangkan bagian jam, menit, detik, dan milidetik
          recordDate.setHours(0, 0, 0, 0);
          filterDateClone.setHours(0, 0, 0, 0);

          return recordDate.getTime() === filterDateClone.getTime();
        }
      );

      // Menambahkan filteredMedicalRecords ke dalam objek patient jika ada yang sesuai
      if (filteredMedicalRecords.length > 0) {
        return {
          ...patient,
          medical_records: filteredMedicalRecords.reduce((acc, record) => {
            acc[record.identifier] = record;
            return acc;
          }, {}),
        };
      } else {
        return null; // Jika tidak ada yang sesuai, kembalikan null
      }
    });

    // Menghapus elemen-elemen null dari array hasil filter
    const filteredPatientsWithoutNull = filteredData.filter(Boolean);

    setFilteredPatients(filteredPatientsWithoutNull);
  };

  console.log(filteredPatients, "patient");

  return (
  <div className="container">
    <img src={imageURL} alt="Satu Sehat" className="satu-sehat-logo" />
    <div className="flex max-w-lg items-start">
      <label className="mt-1">Tanggal Berobat:</label>
      <DatePicker
        selected={filterDate}
        onChange={(date) => {
          setFilterDate(date);
          handleFilter();
        }}
        dateFormat="yyyy-MM-dd"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholderText="Pilih Tanggal"
      />
      <Button
        onClick={handleFilter}
        className="inline-flex ml-2 text-white bg-[#2196F3] border-0 rounded-md py-3 px-5 focus:outline-none hover:bg-2196F3 text-sm"
      >
        Filter
      </Button>
    </div>

    <div>
      {filteredPatients.length > 0 ? (
        filteredPatients.map((patient) => (
          <div key={patient.id} className="patient-card-satu-sehat">
            <h2>
              {patient.name}{" "}
              <span className="generate-id-text">
                Generate ID:{" "}
                {Object.values(patient.medical_records || {})[0]?.identifier}
              </span>
            </h2>
            <p>Identifier: {patient.identifier}</p>
            <p>Number of Medical Records: {patient.number_medical_records}</p>
            {Object.values(patient.medical_records || {}).map((record) => (
              <div key={record.identifier} className="medical-record">
                <h4>Generate ID: {record.identifier}</h4>
                <p>Complaint: {record.complaint}</p>
                <p>Vital Signs:</p>
                <p>Tanda-Tanda Vital:</p>
                <p>SystolicBloodPressure: {record.systolicBloodPressure}</p>
                <p>DiastolicBloodPressure: {record.diastolicBloodPressure}</p>
                <p>HeartRate: {record.heartRate}</p>
                <p>BodyTemperature: {record.bodyTemperature}</p>
                <p>RespiratoryRate: {record.respiratoryRate}</p>
                <p>
                  Condition Physical Examination:{" "}
                  {record.condition_physical_examination}
                </p>
                <p>
                  Diagnosis: {record.diagnosis.code} - {record.diagnosis.name}
                </p>
                <p>Medication: {record.Medication}</p>
                <p>Participant: {record.participant}</p>
                <p>Participant NIK: {record.doctorNIK}</p>
                <p>
                  Encounter Period:{" "}
                  {format(
                    new Date(record.Encounter_period_start),
                    "yyyy-MM-dd HH:mm:ss"
                  )}
                </p>
                <Link to="/encounter"
                  state={{
                    participant: record.participant,
                    patient: patient.name,
                    patientNIK: patient.identifier,
                    periodeStart: record.Encounter_period_start,
                    doctorNIK: record.doctorNIK,
                  }}>
                  <Button
                    className="inline-flex ml-2 mt-2 text-white bg-[#2196F3] border-0 rounded-md py-3 px-5 focus:outline-none hover:bg-2196F3 text-sm"
                  >
                    Encounter
                  </Button>
                </Link>
                <Link to="/condition"
                  state={{
                    patient: patient.name,
                    patientNIK: patient.identifier,
                    observation: record.Observation,
                    codeICD: record.diagnosis.code,
                    dx: record.diagnosis.name,
                  }}>
                  <Button
                    className="inline-flex ml-2 mt-2 text-white bg-[#2196F3] border-0 rounded-md py-3 px-5 focus:outline-none hover:bg-2196F3 text-sm"
                  >
                    Condition
                  </Button>
                </Link>
                <Link to="/nadi"
                  state={{
                    patient: patient.name,
                    patientNIK: patient.identifier,
                    codeICD: record.diagnosis.code,
                    dx: record.diagnosis.name,
                    nadi: record.heartRate,
                  }}>
                  <Button
                    className="inline-flex ml-2 mt-2 text-white bg-[#2196F3] border-0 rounded-md py-3 px-5 focus:outline-none hover:bg-2196F3 text-sm"
                  >
                    Observation-Nadi
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ))
      ) : (
        <p className="no-results">
          Oops... Tidak ada pasien di tanggal ini!!
        </p>
      )}
    </div>
  </div>
);
};

export default SatuSehat;