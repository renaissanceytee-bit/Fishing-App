import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  IconButton,
  TextInput,
  Button,
  Divider,
} from 'react-native-paper';
import api from '../../services/api';

const { width } = Dimensions.get('window');

export default function CatchDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [catchData, setCatchData] = useState<any>(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCatchDetails();
    loadComments();
  }, [id]);

  const loadCatchDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/catches/${id}`);
      setCatchData(response.data);
    } catch (error) {
      console.error('Failed to load catch:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await api.get('/social/comments', {
        params: { catchId: id },
      });
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleLike = async () => {
    try {
      await api.post('/social/like', { catchId: id });
      loadCatchDetails();
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      await api.post('/social/comment', {
        catchId: id,
        content: newComment,
      });
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Failed to comment:', error);
    }
  };

  if (loading || !catchData) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Card.Title
        title={catchData.user.username}
        subtitle={new Date(catchData.timestamp).toLocaleString()}
        left={(props) => (
          <Avatar.Image
            {...props}
            source={{ uri: catchData.user.avatar || 'https://via.placeholder.com/150' }}
          />
        )}
      />

      {/* Photos */}
      {catchData.photos.length > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {catchData.photos.map((photo: string, index: number) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={styles.photo}
            />
          ))}
        </ScrollView>
      )}

      {/* Details */}
      <View style={styles.details}>
        <Text variant="headlineSmall">
          {catchData.species?.name || catchData.customSpecies}
        </Text>

        {catchData.weight && (
          <View style={styles.measurements}>
            <Text variant="titleMedium">
              ⚖️ {catchData.weight} kg
            </Text>
            <Text variant="titleMedium">
              📏 {catchData.length} cm
            </Text>
          </View>
        )}

        <Text variant="bodyLarge" style={styles.location}>
          📍 {catchData.locationName}
        </Text>

        {catchData.waterBody && (
          <Text variant="bodyMedium">💧 {catchData.waterBody}</Text>
        )}

        {catchData.bait && (
          <Text variant="bodyMedium">🎣 Bait: {catchData.bait}</Text>
        )}

        {catchData.lure && (
          <Text variant="bodyMedium">🌀 Lure: {catchData.lure}</Text>
        )}

        {catchData.isReleased && (
          <Text variant="bodyMedium" style={styles.released}>
            🌊 Catch & Release ✓
          </Text>
        )}

        {catchData.description && (
          <Text variant="bodyMedium" style={styles.description}>
            {catchData.description}
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionRow}>
          <IconButton icon="heart" onPress={handleLike} />
          <Text>{catchData._count?.likes || 0} likes</Text>
          <IconButton icon="comment" />
          <Text>{catchData._count?.comments || 0} comments</Text>
        </View>
      </View>

      <Divider />

      {/* Comments */}
      <View style={styles.commentsSection}>
        <Text variant="titleMedium" style={styles.commentsTitle}>
          Comments
        </Text>

        {comments.map((comment: any) => (
          <View key={comment.id} style={styles.comment}>
            <Avatar.Image
              size={32}
              source={{ uri: comment.user.avatar || 'https://via.placeholder.com/150' }}
            />
            <View style={styles.commentContent}>
              <Text variant="labelMedium">{comment.user.username}</Text>
              <Text variant="bodyMedium">{comment.content}</Text>
              <Text variant="bodySmall" style={styles.commentTime}>
                {new Date(comment.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}

        {/* Add Comment */}
        <View style={styles.addComment}>
          <TextInput
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            mode="outlined"
            style={styles.commentInput}
            multiline
          />
          <Button
            mode="contained"
            onPress={handleComment}
            disabled={!newComment.trim()}
          >
            Post
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  photo: {
    width,
    height: width,
  },
  details: {
    padding: 16,
  },
  measurements: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  location: {
    marginTop: 8,
  },
  released: {
    marginTop: 8,
    color: '#20c997',
    fontWeight: 'bold',
  },
  description: {
    marginTop: 12,
  },
  actions: {
    paddingHorizontal: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsSection: {
    padding: 16,
  },
  commentsTitle: {
    marginBottom: 16,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentTime: {
    marginTop: 4,
    opacity: 0.6,
  },
  addComment: {
    marginTop: 16,
  },
  commentInput: {
    marginBottom: 8,
  },
});
