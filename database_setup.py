from sqlalchemy import create_engine
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship


Base = declarative_base()


class Questions(Base):
    __tablename__ = 'questions'

    id = Column(UUID, primary_key=True, nullable=False)
    question = Column(String)
    posted_by = Column(String)
    posted_on = Column(DateTime)

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'question': self.question,
            'posted_by': self.posted_by,
            'posted_on': self.posted_on
        }


class Choices(Base):
    __tablename__ = 'choices'

    id = Column(UUID, primary_key=True, nullable=False)
    question_id = Column(UUID, ForeignKey('questions.id'), nullable=False)
    questions = relationship(Questions)
    choice_order = Column(Integer, nullable=False)
    choice = Column(String)
    votes = Column(Integer)

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'question_id': self.question_id,
            'choice_order': self.choice_order,
            'choice': self.choice,
            'votes': self.votes
        }


class UserStatus(Base):
    __tablename__ = 'userstatus'

    id = Column(UUID, primary_key=True, nullable=False)
    question_id = Column(UUID, ForeignKey('questions.id'), nullable=False)
    questions = relationship(Questions)
    username = Column(String)

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'question_id': self.question_id,
            'username': self.username
        }


engine = create_engine('postgresql+psycopg2://mychoice:mychoice@localhost/mychoice')


Base.metadata.create_all(engine)
