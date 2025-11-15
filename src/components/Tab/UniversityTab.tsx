'use client';

import { Department, University } from '@/data/universities';

import UniversityEditor from './UniversityEditor';
import UniversityList from './UniversityList';

type EditingDept = null | { univId: string; facId: string; deptId: string; temp: Department };

type Props = {
  universities: University[];
  editingUniversity: null | University;
  editingDept: EditingDept;
  selectedUnivId: string;
  selectedDeptId: string;
  onAddUniversity: () => void;
  onSelectUniversity: (id: string) => void;
  onSelectFaculty: (univId: string, facId: string) => void;
  onSelectDept: (univId: string, facId: string, deptId: string) => void;
  onSetEditingDept: (p: EditingDept) => void;
  onEditUniversity: (u: University) => void;
  addDepartment: (univId: string, facId: string) => void;
  deleteUniversity: (id: string) => void;
  deleteFaculty: (univId: string, facId: string) => void;
  deleteDepartment: (univId: string, facId: string, deptId: string) => void;
  saveDept: (payload: { univId: string; facId: string; deptId: string; temp: Department }) => void;
  onSaveUniversity: (u: University) => void;
  onCancelEditUniversity: () => void;
};

export default function UniversityTab({
  universities,
  editingUniversity,
  editingDept,
  selectedUnivId,
  selectedDeptId,
  onAddUniversity,
  onSelectUniversity,
  onSelectFaculty,
  onSelectDept,
  onSetEditingDept,
  onEditUniversity,
  addDepartment,
  deleteUniversity,
  deleteFaculty,
  deleteDepartment,
  saveDept,
  onSaveUniversity,
  onCancelEditUniversity,
}: Props) {
  return (
    <div>
      {editingUniversity ? (
        <UniversityEditor
          initialUniversity={editingUniversity}
          onSave={u => onSaveUniversity(u)}
          onCancel={onCancelEditUniversity}
        />
      ) : (
        <UniversityList
          universities={universities}
          selectedUnivId={selectedUnivId}
          selectedDeptId={selectedDeptId}
          editingDept={editingDept}
          onAddUniversity={onAddUniversity}
          onSelectUniversity={onSelectUniversity}
          onSelectFaculty={onSelectFaculty}
          onSelectDept={onSelectDept}
          onSetEditingDept={onSetEditingDept}
          onEditUniversity={onEditUniversity}
          addDepartment={addDepartment}
          deleteUniversity={deleteUniversity}
          deleteFaculty={deleteFaculty}
          deleteDepartment={deleteDepartment}
          saveDept={saveDept}
        />
      )}
    </div>
  );
}
