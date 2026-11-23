import { useEffect } from "react";
import { AiOutlinePrinter } from "react-icons/ai";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import HomeLayout from "../Layouts/HomeLayout";

function Certificate() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { data } = useSelector((s) => s.auth);

  const course = state?.course || state || {};
  const user = state?.user || data || {};
  const studentName = (user?.fullName || "Student").toUpperCase();
  const courseTitle = course?.title || "Course";
  const instructor = course?.createdBy || "Instructor";
  const issuedOn = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (!course?.title) {
      // allow viewing with query state; otherwise redirect back
    }
  }, [course]);

  function handlePrint() {
    window.print();
  }

  return (
    <HomeLayout>
      <div className="min-h-[90vh] flex flex-col items-center justify-center py-10 px-4">
        <div className="flex gap-3 mb-6 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md font-semibold"
          >
            Back
          </button>
          <button
            onClick={handlePrint}
            className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-md font-semibold flex items-center gap-2"
          >
            <AiOutlinePrinter /> Print / Save as PDF
          </button>
        </div>

        <div
          id="certificate"
          className="w-full max-w-4xl bg-white text-black shadow-[0_0_20px_black] rounded-lg p-8 md:p-12 border-8 border-yellow-500 print:shadow-none print:border-4"
        >
          <div className="text-center border-4 border-yellow-600 p-6 md:p-10">
            <p className="text-sm tracking-[0.3em] text-gray-600 uppercase">
              Certificate of Completion
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-yellow-600 mt-2">
              Learning Management System
            </h1>
            <p className="mt-6 text-gray-700">This is to certify that</p>
            <h2 className="text-2xl md:text-4xl font-bold mt-2 border-b-2 border-gray-400 inline-block px-6 pb-2">
              {studentName}
            </h2>
            <p className="mt-6 text-gray-700">
              has successfully completed the course
            </p>
            <h3 className="text-xl md:text-3xl font-semibold text-yellow-700 mt-2">
              {courseTitle}
            </h3>
            <p className="mt-6 text-gray-700">
              Instructor: <span className="font-semibold">{instructor}</span>
            </p>
            <div className="flex justify-between items-end mt-10">
              <div className="text-center">
                <p className="border-t border-black w-40 mx-auto pt-1">
                  {issuedOn}
                </p>
                <p className="text-sm text-gray-600">Date Issued</p>
              </div>
              <div className="text-center">
                <p className="border-t border-black w-40 mx-auto pt-1">
                  Signature
                </p>
                <p className="text-sm text-gray-600">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificate, #certificate * { visibility: visible; }
          #certificate { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </HomeLayout>
  );
}

export default Certificate;
