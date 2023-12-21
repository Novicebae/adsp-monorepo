import React, { useState } from 'react';

import { useDispatch } from 'react-redux';

import { TableDiv, DeleteConfirmation } from '../styled-components';
import { DeleteModal } from '@components/DeleteModal';
import { deleteCommentComments } from '@store/comment/action';

import { Comment, TopicItem } from '@store/comment/model';

interface commentDeleteProps {
  topic: TopicItem;
  selectedComment: Comment;
  selectedType: string;
  deleteConfirmation: boolean;
  onCancel?: () => void;
  deleteComment?: () => void;
}

export const DeleteConfirmationsView = ({
  topic,
  selectedComment,
  selectedType,
  deleteConfirmation,
  onCancel,
  deleteComment,
}: commentDeleteProps): JSX.Element => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(deleteConfirmation);
  const dispatch = useDispatch();

  return (
    <TableDiv key="comment">
      <DeleteModal
        title="Delete comment"
        isOpen={showDeleteConfirmation}
        content={
          <DeleteConfirmation>
            <div>
              Are you sure you wish to delete <p>{`${selectedComment.title}?`}</p>
            </div>
          </DeleteConfirmation>
        }
        onCancel={() => {
          setShowDeleteConfirmation(false);
          onCancel();
        }}
        onDelete={() => {
          dispatch(deleteCommentComments({ topicId: topic.id, comment: selectedComment.id }));
          deleteComment();
          setShowDeleteConfirmation(false);
        }}
      />
    </TableDiv>
  );
};
