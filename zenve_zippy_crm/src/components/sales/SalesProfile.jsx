import { useState } from "react";
import "./sales-portal.css";

const ROLE_LABEL = {
  executive: "Sales Executive",
  manager: "Sales Manager",
  regionalManager: "Regional Manager",
};

function initialsOf(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

// These fields aren't in the backend schema yet (no designation, DOB, DOJ,
// gender, marital status, blood group, personal email, CUG number,
// emergency contact, address, or document-upload columns on
// sales_executives). They're editable here so the page matches the
// reference layout, but stay in local state only until a real backend
// field exists — nothing here is persisted yet, matching "UI first,
// backend later."
const BLANK_EXTRA = {
  designation: "",
  department: "",
  dob: "",
  doj: "",
  gender: "",
  maritalStatus: "",
  bloodGroup: "",
  personalEmail: "",
  cugNumber: "",
  emergencyContactNumber: "",
  emergencyContactName: "",
  address: "",
  pinCode: "",
  city: "",
  country: "India",
  telephoneNo: "",
};

export default function SalesProfile({ session }) {
  const [extra, setExtra] = useState(BLANK_EXTRA);
  const [savedNote, setSavedNote] = useState("");

  const exec = session.executive;
  const displayName = exec?.name || ROLE_LABEL[session.role];

  function update(field, value) {
    setExtra((prev) => ({ ...prev, [field]: value }));
    setSavedNote("");
  }

  function handleUpdate(e) {
    e.preventDefault();
    setSavedNote("Saved locally for this session — not yet persisted to a backend field.");
  }

  function handleReset() {
    setExtra(BLANK_EXTRA);
    setSavedNote("");
  }

  return (
    <div>
      <div className="sp-card">
        <div className="sp-profile-header">
          <div className="sp-profile-avatar">{initialsOf(displayName)}</div>
          <div>
            <h2 style={{ margin: 0 }}>{displayName}</h2>
            <p className="sp-muted">{ROLE_LABEL[session.role]}</p>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="sp-profile-grid">
            <div className="sp-profile-field">
              <label>Employee Code</label>
              <input value={exec?.code || "—"} disabled />
            </div>
            <div className="sp-profile-field">
              <label>Employee Name</label>
              <input value={exec?.name || displayName} disabled />
            </div>
            <div className="sp-profile-field">
              <label>Designation</label>
              <input value={extra.designation} onChange={(e) => update("designation", e.target.value)} placeholder="e.g. MR" />
            </div>
            <div className="sp-profile-field">
              <label>Department</label>
              <input value={extra.department} onChange={(e) => update("department", e.target.value)} placeholder="e.g. Field Sales" />
            </div>

            <div className="sp-profile-field">
              <label>Head Quarter</label>
              <input value={exec?.region || exec?.city || "—"} disabled />
            </div>
            <div className="sp-profile-field">
              <label>Company Email</label>
              <input value={exec?.email || "—"} disabled />
            </div>
            <div className="sp-profile-field">
              <label>DOB</label>
              <input type="date" value={extra.dob} onChange={(e) => update("dob", e.target.value)} />
            </div>
            <div className="sp-profile-field">
              <label>DOJ</label>
              <input type="date" value={extra.doj} onChange={(e) => update("doj", e.target.value)} />
            </div>

            <div className="sp-profile-field">
              <label>Gender</label>
              <select value={extra.gender} onChange={(e) => update("gender", e.target.value)}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="sp-profile-field">
              <label>Marital Status</label>
              <select value={extra.maritalStatus} onChange={(e) => update("maritalStatus", e.target.value)}>
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </div>
            <div className="sp-profile-field">
              <label>Blood Group</label>
              <select value={extra.bloodGroup} onChange={(e) => update("bloodGroup", e.target.value)}>
                <option value="">Select</option>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
            <div className="sp-profile-field">
              <label>Personal Email</label>
              <input value={extra.personalEmail} onChange={(e) => update("personalEmail", e.target.value)} />
            </div>

            <div className="sp-profile-field">
              <label>Personal Number</label>
              <input value={exec?.phone || "—"} disabled />
            </div>
            <div className="sp-profile-field">
              <label>CUG Number</label>
              <input value={extra.cugNumber} onChange={(e) => update("cugNumber", e.target.value)} />
            </div>
            <div className="sp-profile-field">
              <label>Emergency Contact Number</label>
              <input value={extra.emergencyContactNumber} onChange={(e) => update("emergencyContactNumber", e.target.value)} />
            </div>
            <div className="sp-profile-field">
              <label>Emergency Contact Name</label>
              <input value={extra.emergencyContactName} onChange={(e) => update("emergencyContactName", e.target.value)} />
            </div>
          </div>

          <p className="sp-profile-section-title">Address</p>
          <div className="sp-profile-grid">
            <div className="sp-profile-field" style={{ gridColumn: "span 2" }}>
              <label>Address</label>
              <input value={extra.address} onChange={(e) => update("address", e.target.value)} />
            </div>
            <div className="sp-profile-field">
              <label>Pin Code</label>
              <input value={extra.pinCode} onChange={(e) => update("pinCode", e.target.value)} />
            </div>
            <div className="sp-profile-field">
              <label>City</label>
              <input value={extra.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div className="sp-profile-field">
              <label>Country</label>
              <input value={extra.country} onChange={(e) => update("country", e.target.value)} />
            </div>
            <div className="sp-profile-field">
              <label>Telephone No</label>
              <input value={extra.telephoneNo} onChange={(e) => update("telephoneNo", e.target.value)} />
            </div>
          </div>

          <p className="sp-profile-section-title">Documents</p>
          <div className="sp-file-row">
            <div className="sp-file-field sp-profile-field">
              <label>Select Signature</label>
              <input type="file" />
            </div>
            <div className="sp-file-field sp-profile-field">
              <label>Select Profile Photo</label>
              <input type="file" />
            </div>
          </div>
          <div className="sp-file-row" style={{ marginTop: 14 }}>
            <div className="sp-file-field sp-profile-field">
              <label>Select PAN Card</label>
              <input type="file" />
            </div>
            <div className="sp-file-field sp-profile-field">
              <label>Select Aadhaar Card</label>
              <input type="file" />
            </div>
          </div>

          <div className="sp-profile-actions">
            <button type="submit" className="sp-login-btn" style={{ width: "auto", padding: "0 20px" }}>
              Update
            </button>
            <button type="button" className="sp-logout-btn" onClick={handleReset}>
              Reset
            </button>
          </div>
          {savedNote && <p className="sp-login-note">{savedNote}</p>}
        </form>
      </div>
    </div>
  );
}
