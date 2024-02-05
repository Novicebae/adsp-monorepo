import React from 'react';
import { Route, Routes } from 'react-router-dom-6';
import { Task } from './task';
import { TaskDefinitionEditor } from './TaskDefinationEditor';

export const TaskRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Task />} />
      <Route path="/edit/:id" element={<TaskDefinitionEditor />} />
      <Route path="/new" element={<TaskDefinitionEditor />} />
    </Routes>
  );
};
